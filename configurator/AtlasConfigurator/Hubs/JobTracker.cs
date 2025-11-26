using System.Collections.Concurrent;

namespace AtlasConfigurator.Hubs
{
    public static class JobTracker
    {
        // Maps JobId to SignalR ConnectionId
        public static ConcurrentDictionary<string, string> JobIdToConnectionMap = new();
    }
}
