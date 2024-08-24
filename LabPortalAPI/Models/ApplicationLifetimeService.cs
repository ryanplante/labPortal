public class ApplicationLifetimeService
{
    public DateTime ApplicationStartTime { get; }

    public ApplicationLifetimeService()
    {
        ApplicationStartTime = DateTime.UtcNow;
    }
}
