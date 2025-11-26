using AtlasConfigurator.Models.Auth;
using AtlasConfigurator.Models.Database;

namespace AtlasConfigurator.Interface
{
    public interface IAtlasManagementService
    {
        Task<AtlasManagement> GetAtlasManagementUser(string UserId);
        Task<bool> CreateAtlasUserIfNotExist(string UserId, string email);
        Task<bool> IsAtlasManagementUser(string UserId);
        Task<bool> SaveCartToDB(Submission sub);
        Task<List<Submission>> ListSubmissions();
        Task<Submission> GetSubmissionById(int Id);
    }
}
