using Microsoft.JSInterop;

namespace AtlasConfigurator.Workers
{
    public class ThemeService
    {
        private readonly IJSRuntime _jsRuntime;
        public bool IsDarkTheme { get; private set; }
        public event Action? OnChange;

        public ThemeService(IJSRuntime jsRuntime)
        {
            _jsRuntime = jsRuntime;
        }

        public async Task InitializeThemeAsync()
        {
            var isDarkThemeString = await _jsRuntime.InvokeAsync<string>("localStorage.getItem", "isDarkTheme");
            IsDarkTheme = isDarkThemeString == "true";
            NotifyStateChanged();
        }


        public async Task ToggleThemeAsync()
        {
            IsDarkTheme = !IsDarkTheme;
            await _jsRuntime.InvokeVoidAsync("toggleTheme", IsDarkTheme);
            NotifyStateChanged();
        }

        private void NotifyStateChanged() => OnChange?.Invoke();
    }

}
