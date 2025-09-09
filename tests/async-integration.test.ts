import {
  Option,
  Some,
  None,
  Result,
  Ok,
  Err,
  transpose,
  flatten,
} from "../src";

describe("Async Integration Tests", () => {
  describe("async utility functions", () => {
    test("async transpose Option<Result> to Result<Option>", async () => {
      const asyncGetResult = async (
        shouldSucceed: boolean
      ): Promise<Option<Result<string, string>>> => {
        await new Promise((resolve) => setTimeout(resolve, 5));

        if (shouldSucceed) {
          return Some(Ok("Success"));
        } else {
          return Some(Err("Failed"));
        }
      };

      const successOption = await asyncGetResult(true);
      const transposed = transpose(successOption);
      expect(transposed.isOk()).toBe(true);
      expect(transposed.unwrap().isSome()).toBe(true);
      expect(transposed.unwrap().unwrap()).toBe("Success");

      const failureOption = await asyncGetResult(false);
      const transposedFailure = transpose(failureOption);
      expect(transposedFailure.isErr()).toBe(true);
      expect(transposedFailure.unwrapErr()).toBe("Failed");
    });

    test("async flatten nested Options", async () => {
      const asyncGetNestedOption = async (
        depth: number
      ): Promise<Option<Option<string>>> => {
        await new Promise((resolve) => setTimeout(resolve, 5));

        if (depth === 0) {
          return None();
        } else if (depth === 1) {
          return Some(None());
        } else {
          return Some(Some("Deep value"));
        }
      };

      const deep = await asyncGetNestedOption(2);
      const flattened = flatten(deep);
      expect(flattened.isSome()).toBe(true);
      expect(flattened.unwrap()).toBe("Deep value");

      const shallow = await asyncGetNestedOption(1);
      const flattenedShallow = flatten(shallow);
      expect(flattenedShallow.isNone()).toBe(true);
    });
  });

  describe("real-world async scenarios", () => {
    test("async HTTP client with retry logic", async () => {
      interface HttpResponse {
        status: number;
        data: any;
      }

      type HttpError = "NetworkError" | "TimeoutError" | "ServerError";

      let attempt = 0;
      const asyncHttpRequest = async (
        url: string
      ): Promise<Result<HttpResponse, HttpError>> => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        attempt++;

        if (url === "/always-fail") {
          return Err("NetworkError" as HttpError);
        }

        if (url === "/retry-then-success" && attempt < 3) {
          return Err("TimeoutError" as HttpError);
        }

        if (url === "/server-error") {
          return Err("ServerError" as HttpError);
        }

        return Ok({ status: 200, data: { message: "Success" } });
      };

      const asyncHttpWithRetry = async (
        url: string,
        maxRetries: number = 3
      ): Promise<Result<HttpResponse, HttpError>> => {
        let lastError: HttpError = "NetworkError";

        for (let i = 0; i <= maxRetries; i++) {
          const result = await asyncHttpRequest(url);

          if (result.isOk()) {
            return result;
          }

          lastError = result.unwrapErr();

          // Don't retry server errors
          if (lastError === "ServerError") {
            break;
          }

          // Wait before retry (exponential backoff)
          if (i < maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, i) * 100)
            );
          }
        }

        return Err(lastError);
      };

      // Reset attempt counter
      attempt = 0;
      const successResult = await asyncHttpWithRetry("/success");
      expect(successResult.isOk()).toBe(true);
      expect(successResult.unwrap().status).toBe(200);

      // Reset attempt counter
      attempt = 0;
      const retryResult = await asyncHttpWithRetry("/retry-then-success");
      expect(retryResult.isOk()).toBe(true);
      expect(attempt).toBe(3);

      // Reset attempt counter
      attempt = 0;
      const alwaysFailResult = await asyncHttpWithRetry("/always-fail");
      expect(alwaysFailResult.isErr()).toBe(true);
      expect(attempt).toBe(4); // 1 initial + 3 retries

      // Reset attempt counter
      attempt = 0;
      const serverErrorResult = await asyncHttpWithRetry("/server-error");
      expect(serverErrorResult.isErr()).toBe(true);
      expect(serverErrorResult.unwrapErr()).toBe("ServerError");
      expect(attempt).toBe(1); // No retries for server errors
    });

    test("async data pipeline with transformation stages", async () => {
      interface RawData {
        id: string;
        raw: string;
      }

      interface ProcessedData {
        id: string;
        processed: string;
        timestamp: number;
      }

      interface EnrichedData {
        id: string;
        processed: string;
        timestamp: number;
        metadata: { source: string; version: number };
      }

      const asyncFetchRawData = async (
        id: string
      ): Promise<Result<RawData, string>> => {
        await new Promise((resolve) => setTimeout(resolve, 10));

        if (id === "valid") {
          return Ok({ id, raw: "raw data content" });
        }
        return Err("Data not found");
      };

      const asyncProcessData = async (
        raw: RawData
      ): Promise<Result<ProcessedData, string>> => {
        await new Promise((resolve) => setTimeout(resolve, 15));

        if (raw.raw.length === 0) {
          return Err("Empty data cannot be processed");
        }

        return Ok({
          id: raw.id,
          processed: raw.raw.toUpperCase(),
          timestamp: Date.now(),
        });
      };

      const asyncEnrichData = async (
        processed: ProcessedData
      ): Promise<Result<EnrichedData, string>> => {
        await new Promise((resolve) => setTimeout(resolve, 20));

        return Ok({
          ...processed,
          metadata: {
            source: "async-pipeline",
            version: 1,
          },
        });
      };

      const asyncDataPipeline = async (
        id: string
      ): Promise<Result<EnrichedData, string>> => {
        const rawResult = await asyncFetchRawData(id);
        if (rawResult.isErr()) {
          return Err(`Fetch failed: ${rawResult.unwrapErr()}`);
        }

        const processedResult = await asyncProcessData(rawResult.unwrap());
        if (processedResult.isErr()) {
          return Err(`Processing failed: ${processedResult.unwrapErr()}`);
        }

        const enrichedResult = await asyncEnrichData(processedResult.unwrap());
        if (enrichedResult.isErr()) {
          return Err(`Enrichment failed: ${enrichedResult.unwrapErr()}`);
        }

        return enrichedResult;
      };

      const result = await asyncDataPipeline("valid");
      expect(result.isOk()).toBe(true);

      const enriched = result.unwrap();
      expect(enriched.id).toBe("valid");
      expect(enriched.processed).toBe("RAW DATA CONTENT");
      expect(enriched.metadata.source).toBe("async-pipeline");

      const failureResult = await asyncDataPipeline("invalid");
      expect(failureResult.isErr()).toBe(true);
      expect(failureResult.unwrapErr()).toBe("Fetch failed: Data not found");
    });

    test("async batch processing with partial failures", async () => {
      interface BatchItem {
        id: string;
        data: string;
      }

      interface ProcessedItem {
        id: string;
        result: string;
        processingTime: number;
      }

      const asyncProcessItem = async (
        item: BatchItem
      ): Promise<Result<ProcessedItem, string>> => {
        const processingTime = Math.random() * 50 + 10;
        await new Promise((resolve) => setTimeout(resolve, processingTime));

        if (item.data === "fail") {
          return Err(`Processing failed for item ${item.id}`);
        }

        if (item.data === "slow" && processingTime < 30) {
          return Err(`Timeout processing item ${item.id}`);
        }

        return Ok({
          id: item.id,
          result: item.data.toUpperCase(),
          processingTime: Math.round(processingTime),
        });
      };

      const asyncBatchProcess = async (
        items: BatchItem[]
      ): Promise<{
        successful: ProcessedItem[];
        failed: Array<{ id: string; error: string }>;
      }> => {
        const results = await Promise.all(
          items.map(async (item) => {
            const result = await asyncProcessItem(item);
            return { item, result };
          })
        );

        const successful: ProcessedItem[] = [];
        const failed: Array<{ id: string; error: string }> = [];

        results.forEach(({ item, result }) => {
          result.match({
            Ok: (processed) => successful.push(processed),
            Err: (error) => failed.push({ id: item.id, error }),
          });
        });

        return { successful, failed };
      };

      const batchItems: BatchItem[] = [
        { id: "1", data: "success1" },
        { id: "2", data: "fail" },
        { id: "3", data: "success2" },
        { id: "4", data: "slow" },
        { id: "5", data: "success3" },
      ];

      const batchResult = await asyncBatchProcess(batchItems);

      expect(batchResult.successful.length).toBeGreaterThan(0);
      expect(batchResult.failed.length).toBeGreaterThan(0);

      // Check that successful items are processed correctly
      const successfulIds = batchResult.successful.map((item) => item.id);
      expect(successfulIds).toContain("1");
      expect(successfulIds).toContain("3");
      expect(successfulIds).toContain("5");

      // Check that failed items have proper error messages
      const failedIds = batchResult.failed.map((item) => item.id);
      expect(failedIds).toContain("2");

      const failedItem2 = batchResult.failed.find((item) => item.id === "2");
      expect(failedItem2?.error).toBe("Processing failed for item 2");
    });

    test("async circuit breaker pattern", async () => {
      interface CircuitBreakerState {
        failures: number;
        lastFailure: number;
        state: "closed" | "open" | "half-open";
      }

      class AsyncCircuitBreaker {
        private state: CircuitBreakerState = {
          failures: 0,
          lastFailure: 0,
          state: "closed",
        };

        constructor(
          private maxFailures: number = 3,
          private timeout: number = 5000
        ) {}

        async call<T>(
          fn: () => Promise<Result<T, string>>
        ): Promise<Result<T, string>> {
          const now = Date.now();

          // Check if circuit should be reset
          if (
            this.state.state === "open" &&
            now - this.state.lastFailure > this.timeout
          ) {
            this.state.state = "half-open";
            this.state.failures = 0;
          }

          // Block calls if circuit is open
          if (this.state.state === "open") {
            return Err("Circuit breaker is open");
          }

          try {
            const result = await fn();

            if (result.isOk()) {
              // Reset on success
              this.state.failures = 0;
              this.state.state = "closed";
              return result;
            } else {
              // Handle failure
              this.state.failures++;
              this.state.lastFailure = now;

              if (this.state.failures >= this.maxFailures) {
                this.state.state = "open";
              }

              return result;
            }
          } catch (error) {
            // Handle unexpected errors
            this.state.failures++;
            this.state.lastFailure = now;

            if (this.state.failures >= this.maxFailures) {
              this.state.state = "open";
            }

            return Err("Unexpected error occurred");
          }
        }

        getState(): CircuitBreakerState {
          return { ...this.state };
        }
      }

      let callCount = 0;
      const unreliableService = async (): Promise<Result<string, string>> => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        callCount++;

        // Fail first 3 calls, then succeed
        if (callCount <= 3) {
          return Err("Service unavailable");
        }

        return Ok("Service response");
      };

      const circuitBreaker = new AsyncCircuitBreaker(3, 100);

      // First 3 calls should fail and open the circuit
      for (let i = 0; i < 3; i++) {
        const result = await circuitBreaker.call(unreliableService);
        expect(result.isErr()).toBe(true);
      }

      expect(circuitBreaker.getState().state).toBe("open");

      // Next call should be blocked by circuit breaker
      const blockedResult = await circuitBreaker.call(unreliableService);
      expect(blockedResult.isErr()).toBe(true);
      expect(blockedResult.unwrapErr()).toBe("Circuit breaker is open");

      // Wait for circuit to reset
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Now calls should work again
      const resetResult = await circuitBreaker.call(unreliableService);
      expect(resetResult.isOk()).toBe(true);
      expect(resetResult.unwrap()).toBe("Service response");
      expect(circuitBreaker.getState().state).toBe("closed");
    });
  });
});
