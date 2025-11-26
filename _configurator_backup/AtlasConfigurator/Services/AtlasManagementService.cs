using AtlasConfigurator.Data;
using AtlasConfigurator.Interface;
using AtlasConfigurator.Models.Auth;
using AtlasConfigurator.Models.Database;
using Microsoft.EntityFrameworkCore;

namespace AtlasConfigurator.Services
{
    public class AtlasManagementService : IAtlasManagementService
    {
        private readonly Context _context;
        public AtlasManagementService(Context context)
        {
            _context = context;
        }
        public async Task<AtlasManagement> GetAtlasManagementUser(string UserId)
        {
            return await _context.AtlasManagements.Where(x => x.WorkOsUserId == UserId).FirstOrDefaultAsync();
        }
        public async Task<bool> CreateAtlasUserIfNotExist(string UserId, string email)
        {
            bool user = await _context.AtlasManagements.Where(x => x.WorkOsUserId == UserId).AnyAsync();
            if (user)
            { return true; }
            else
            {
                AtlasManagement atlasManagement = new AtlasManagement();
                atlasManagement.WorkOsUserId = UserId;
                atlasManagement.Email = email;
                await _context.AtlasManagements.AddAsync(atlasManagement);
                await _context.SaveChangesAsync();
                return true;
            }
        }
        public async Task<bool> IsAtlasManagementUser(string UserId)
        {
            return await _context.AtlasManagements.Where(x => x.WorkOsUserId == UserId).AnyAsync();
        }
        public async Task<bool> SaveCartToDB(Submission sub)
        {
            try
            {
                // Add the submission entity to the context
                await _context.Submissions.AddAsync(sub);

                // Save changes to the database
                int changes = await _context.SaveChangesAsync();

                // Return true if one or more entities were changed in the database
                return changes > 0;
            }
            catch (Exception ex)
            {
                // Return false to indicate failure
                return false;
            }
        }

        public async Task<List<Submission>> ListSubmissions()
        {
            return await _context.Submissions.ToListAsync();
        }
        public async Task<Submission> GetSubmissionById(int Id)
        {
            return await _context.Submissions.Where(x => x.Id == Id).FirstOrDefaultAsync();
        }
    }
}
