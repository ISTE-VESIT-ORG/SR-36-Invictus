// Simple concurrency runner that executes async tasks with a limit.
export async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency = 3
): Promise<Array<T | null>> {
  const results: Array<T | null> = new Array(tasks.length).fill(null);
  let idx = 0;

  return await new Promise((resolve) => {
    let active = 0;

    const runNext = () => {
      if (idx >= tasks.length && active === 0) {
        resolve(results);
        return;
      }

      while (active < concurrency && idx < tasks.length) {
        const current = idx++;
        active++;
        tasks[current]()
          .then((res) => {
            results[current] = res;
          })
          .catch((err) => {
            // Log upstream error but continue (caller may handle nulls)
            console.warn('[promisePool] task failed:', err);
            results[current] = null;
          })
          .finally(() => {
            active--;
            runNext();
          });
      }
    };

    runNext();
  });
}
