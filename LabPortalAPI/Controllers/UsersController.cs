using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LabPortal.Models;
using System.Text;
using System.Security.Cryptography;
using LabPortal.Models.Dto;

namespace LabPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly TESTContext _context;

        public UsersController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            if (_context.Users == null)
            {
                return NotFound();
            }

            var users = await _context.Users.ToListAsync();
            var userDtos = users.Select(user => new UserDto
            {
                UserId = user.UserId,
                FName = user.FName,
                LName = user.LName,
                UserDept = user.UserDept,
                PrivLvl = user.PrivLvl,
                IsTeacher = user.IsTeacher
            }).ToList();

            return Ok(userDtos);
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            if (_context.Users == null)
            {
                return NotFound();
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserDto
            {
                UserId = user.UserId,
                FName = user.FName,
                LName = user.LName,
                UserDept = user.UserDept,
                PrivLvl = user.PrivLvl,
                IsTeacher = user.IsTeacher
            };

            return Ok(userDto);
        }

        // PUT: api/Users/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutUser(int id, UserDto userDto)
        {
            if (id != userDto.UserId)
            {
                return BadRequest();
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.FName = userDto.FName;
            user.LName = userDto.LName;
            user.UserDept = userDto.UserDept;
            user.PrivLvl = userDto.PrivLvl;
            user.IsTeacher = userDto.IsTeacher;

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }


        // POST: api/Users
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<UserDto>> PostUser(UserDto userDto)
        {
            if (_context.Users == null)
            {
                return Problem("Entity set 'TESTContext.Users' is null.");
            }

            var user = new User
            {
                UserId = userDto.UserId,
                FName = userDto.FName,
                LName = userDto.LName,
                UserDept = userDto.UserDept,
                PrivLvl = userDto.PrivLvl,
                IsTeacher = userDto.IsTeacher
            };

            _context.Users.Add(user);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (UserExists(user.UserId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            userDto.UserId = user.UserId;

            return CreatedAtAction("GetUser", new { id = user.UserId }, userDto);
        }

        // DELETE: api/Users/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteUser(int id)
        {
            if (_context.Users == null)
            {
                return NotFound();
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UserExists(int id)
        {
            return (_context.Users?.Any(e => e.UserId == id)).GetValueOrDefault();
        }

        // GET: api/Users/FuzzySearchById/{query}
        [HttpGet("FuzzySearchById/{query}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<UserDto>>> FuzzySearchById(string query)
        {
            if (_context.Users == null)
            {
                return NotFound();
            }

            if (string.IsNullOrEmpty(query))
            {
                return BadRequest("Query cannot be null or empty.");
            }
            var matchingUsers = await _context.Users
                .ToListAsync(); // Fetch all users into memory

            matchingUsers = matchingUsers
                .Where(u => u.UserId.ToString().PadLeft(8, '0').Contains(query)) // Apply the padding and filtering in memory
                .ToList();

            if (!matchingUsers.Any())
            {
                return NotFound("No users found matching the query.");
            }

            var userDtos = matchingUsers.Select(user => new UserDto
            {
                UserId = user.UserId,
                FName = user.FName,
                LName = user.LName,
                UserDept = user.UserDept,
                PrivLvl = user.PrivLvl,
                IsTeacher = user.IsTeacher
            }).ToList();

            return Ok(userDtos);
        }

        // GET: api/Users/FuzzySearchByName?fname={fname}&lname={lname}
        [HttpGet("FuzzySearchByName")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<UserDto>>> FuzzySearchByName(string? fname, string? lname)
        {
            if (_context.Users == null)
            {
                return NotFound();
            }

            if (string.IsNullOrEmpty(fname) && string.IsNullOrEmpty(lname))
            {
                return BadRequest("At least one of fname or lname must be provided.");
            }

            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(fname))
            {
                query = query.Where(u => EF.Functions.Like(u.FName, $"%{fname}%")); // Fuzzy search on First Name
            }

            if (!string.IsNullOrEmpty(lname))
            {
                query = query.Where(u => EF.Functions.Like(u.LName, $"%{lname}%")); // Fuzzy search on Last Name
            }

            var matchingUsers = await query.ToListAsync();

            if (!matchingUsers.Any())
            {
                return NotFound("No users found matching the query.");
            }

            var userDtos = matchingUsers.Select(user => new UserDto
            {
                UserId = user.UserId,
                FName = user.FName,
                LName = user.LName,
                UserDept = user.UserDept,
                PrivLvl = user.PrivLvl,
                IsTeacher = user.IsTeacher
            }).ToList();

            return Ok(userDtos);
        }



        private async Task<string> GenerateToken(User user)
        {
            // Check and delete any expired tokens from the database
            var expiredTokens = _context.UserTokens
                .Where(t => t.FkUserId == user.UserId && t.Expiration < DateTime.UtcNow);

            if (expiredTokens.Any())
            {
                _context.UserTokens.RemoveRange(expiredTokens);
            }

            // Generate the new token
            var tokenData = Encoding.UTF8.GetBytes($"{user.UserId}:{DateTime.UtcNow}");
            var token = Convert.ToBase64String(tokenData);

            var userToken = new UserToken
            {
                TokenId = Guid.NewGuid(),
                FkUserId = user.UserId,
                Token = token,
                Expiration = DateTime.UtcNow.AddHours(1) // Token expires in 1 hour
            };

            // Add the new token to the database
            _context.UserTokens.Add(userToken);

            // Save changes to the database (deleting expired tokens and adding the new one)
            await _context.SaveChangesAsync();

            return token;
        }


        // GET: api/Users/GetUserByToken/{token}
        [HttpGet("GetUserByToken/{token}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserDto>> GetUserByToken(string token)
        {
            if (_context.UserTokens == null)
            {
                return Problem("Entity set 'TESTContext.UserTokens' is null.");
            }

            var userToken = await _context.UserTokens
                .Include(ut => ut.FkUser)
                .SingleOrDefaultAsync(ut => ut.Token == token && ut.Expiration > DateTime.UtcNow);

            if (userToken == null || userToken.FkUser == null)
            {
                return NotFound("Invalid or expired token.");
            }

            var userDto = new UserDto
            {
                UserId = userToken.FkUser.UserId,
                FName = userToken.FkUser.FName,
                LName = userToken.FkUser.LName,
                UserDept = userToken.FkUser.UserDept,
                PrivLvl = userToken.FkUser.PrivLvl,
                IsTeacher = userToken.FkUser.IsTeacher
            };

            return Ok(userDto);
        }

        // POST: api/Users/ValidateCredentials
        [HttpPost("ValidateCredentials")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<string>> ValidateCredentials([FromBody] UserCredentialsDto credentials)
        {
            if (_context.Users == null)
            {
                return Problem("Entity set 'TESTContext.Users' is null.");
            }

            var user = await _context.Users.SingleOrDefaultAsync(u => u.UserId == credentials.UserId);
            if (user == null)
            {
                return BadRequest("Invalid user ID.");
            }

            // Encrypt the incoming password using the hashing algorithm
            var hashedPassword = HashPassword(credentials.Password, user);

            // Compare the hashed password with the stored hashed password
            if (hashedPassword == user.Password)
            {
                string token = await GenerateToken(user);
                return Ok(token);
            }
            else
            {
                return BadRequest("Invalid password.");
            }
        }

        // PUT: api/Users/UpdatePassword
        [HttpPut("UpdatePassword")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdatePassword([FromHeader] string token, [FromBody] UpdatePasswordDto updatePasswordDto)
        {
            // Call the existing GetUserByToken endpoint
            var response = await GetUserByToken(token);
            if (response.Result is NotFoundObjectResult)
            {
                return Unauthorized("Invalid or expired token.");
            }

            var userDto = (response.Result as OkObjectResult).Value as UserDto; // hack to call Get user result

            // Allow only admins to update passwords
            if (userDto.UserId != updatePasswordDto.UserId && userDto.PrivLvl == 5)
            {
                return Forbid("You do not have permission to update this password.");
            }

            var targetUser = await _context.Users.FindAsync(updatePasswordDto.UserId);
            if (targetUser == null)
            {
                return NotFound();
            }

            // Update the target user's password and lastUpdated fields
            targetUser.LastUpdated = DateTime.UtcNow; // Update the LastUpdated timestamp
            targetUser.Password = HashPassword(updatePasswordDto.Password, targetUser); // Hash the new password

            _context.Entry(targetUser).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(updatePasswordDto.UserId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }




        // PUT: api/Users/UpdatePermission
        [HttpPut("UpdatePermission")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdatePermission([FromHeader] string token, [FromBody] UpdatePermissionDto permissionDto)
        {
            // Call the existing GetUserByToken endpoint
            var response = await GetUserByToken(token);
            if (response.Result is NotFoundObjectResult)
            {
                return Unauthorized("Invalid or expired token.");
            }

            var userDto = (response.Result as OkObjectResult).Value as UserDto;

            // Ensure that only users with permission level >= 4 can update permissions
            if (userDto.PrivLvl < 4)
            {
                return Forbid("You do not have permission to update permissions.");
            }

            var targetUser = await _context.Users.FindAsync(permissionDto.UserId);
            if (targetUser == null)
            {
                return NotFound();
            }

            // Update the target user's permission level
            targetUser.PrivLvl = permissionDto.PermissionLevel;

            _context.Entry(targetUser).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(permissionDto.UserId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok($"User permission level updated to {permissionDto.PermissionLevel}.");
        }


        // DELETE api/Users/DeleteToken/{token}
        [HttpDelete("DeleteToken/{token}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteToken(string token)
        {
            if (_context.UserTokens == null)
            {
                return NotFound("Token storage is not available.");
            }

            var userToken = await _context.UserTokens.SingleOrDefaultAsync(ut => ut.Token == token);
            if (userToken == null)
            {
                return NotFound("Token not found.");
            }

            _context.UserTokens.Remove(userToken);
            await _context.SaveChangesAsync();

            return Ok("Token deleted successfully.");
        }
        // DEVELOPER ONLY: USE THIS TO RESET ALL PASSWORDS
        //[HttpPost("ResetAllPasswords")]
        //[ProducesResponseType(StatusCodes.Status200OK)]
        //[ProducesResponseType(StatusCodes.Status400BadRequest)]
        //[ProducesResponseType(StatusCodes.Status404NotFound)]
        //public async Task<IActionResult> ResetAllPasswords()
        //{
        //    var allUsers = await _context.Users.ToListAsync();
        //    if (allUsers == null || !allUsers.Any())
        //    {
        //        return NotFound("No users found.");
        //    }
        //    foreach (var user in allUsers)
        //    {
        //        // Rounding down LastUpdated to the nearest second
        //        user.LastUpdated = DateTime.UtcNow;

        //        user.Password = HashPassword("password", user);

        //        _context.Entry(user).State = EntityState.Modified;
        //    }

        //    try
        //    {
        //        await _context.SaveChangesAsync();
        //    }
        //    catch (DbUpdateException ex)
        //    {
        //        return BadRequest("Failed to reset passwords. Error: " + ex.Message);
        //    }

        //    return Ok("Passwords for all users have been reset to 'password'.");
        //}


        private string HashPassword(string password, User user)
        {
            // Rounding down LastUpdated to the nearest second
            DateTime roundedLastUpdated = new DateTime(
                user.LastUpdated.Year,
                user.LastUpdated.Month,
                user.LastUpdated.Day,
                user.LastUpdated.Hour,
                user.LastUpdated.Minute,
                user.LastUpdated.Second,
                DateTimeKind.Utc); // Ensures UTC

            // Concatenate userId, fName, lName, and lastUpdated to form the salt
            string salt = $"{user.UserId}{user.FName}{user.LName}{roundedLastUpdated:O}"; // 'O' ensures ISO 8601 format for UTC


            // Combine password with salt
            string concatenatedString = $"{password}{salt}";

            // Hash using SHA256
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(concatenatedString));
                return Convert.ToBase64String(bytes);
            }
        }
    }
}
