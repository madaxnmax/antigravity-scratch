using AtlasConfigurator.Models.SmartCut;
using System.Collections.Concurrent;

namespace AtlasConfigurator.Hubs
{
    public class JobTaskManager
    {
        private readonly ConcurrentDictionary<string, TaskCompletionSource<SmartResponse>> _tasks = new();

        // Add a job task
        public Task<SmartResponse> AddTask(string jobId)
        {
            var tcs = new TaskCompletionSource<SmartResponse>();
            _tasks[jobId] = tcs;
            return tcs.Task;
        }

        // Complete a job task
        public void CompleteTask(string jobId, SmartResponse result)
        {
            if (_tasks.TryRemove(jobId, out var tcs))
            {
                tcs.SetResult(result);
            }
        }

        // Handle errors or timeouts
        public void FailTask(string jobId, Exception ex)
        {
            if (_tasks.TryRemove(jobId, out var tcs))
            {
                tcs.SetException(ex);
            }
        }
    }
}
