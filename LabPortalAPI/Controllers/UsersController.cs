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
                Position = user.Position,
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
                Position = user.Position,
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
            user.Position = userDto.Position;
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
                Position = userDto.Position,
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

        // POST: api/Users/ValidateCredentials
        [HttpPost("ValidateCredentials")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<string>> ValidateCredentials([FromBody] UserCredentials credentials)
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

            // Directly compare the provided encrypted password with the stored encrypted password
            if (credentials.Password == user.Password)
            {
                string token = await GenerateToken(user);
                return Ok(token);
            }
            else
            {
                return BadRequest("Invalid password.");
            }
        }

        private async Task<string> GenerateToken(User user)
        {
            var tokenData = Encoding.UTF8.GetBytes($"{user.UserId}:{DateTime.UtcNow}");
            var token = Convert.ToBase64String(tokenData);

            var userToken = new UserToken
            {
                TokenId = Guid.NewGuid(),
                FkUserId = user.UserId,
                Token = token,
                Expiration = DateTime.UtcNow.AddHours(1) // Token expires in 1 hour
            };

            _context.UserTokens.Add(userToken);
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
                Position = userToken.FkUser.Position,
                IsTeacher = userToken.FkUser.IsTeacher
            };

            return Ok(userDto);
        }
        // GET: api/Users/LastUpdated/{id}
        [HttpGet("LastUpdated/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<DateTime>> GetLastUpdated(int id)
        {
            if (_context.Users == null)
            {
                return NotFound();
            }

            var user = await _context.Users
                .Where(u => u.UserId == id)
                .Select(u => u.LastUpdated)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // PUT: api/Users/UpdatePassword/{id}
        [HttpPut("UpdatePassword/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdatePassword(int id, [FromBody] UpdatePasswordDto updatePasswordDto)
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

            // Update the user's password and lastUpdated fields
            user.Password = updatePasswordDto.Password;
            user.LastUpdated = updatePasswordDto.LastUpdated;

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

    }
}
