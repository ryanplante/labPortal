using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LabPortal.Models;
using LabPortal.Models.Dto;
using LabPortal.Models.CreateDtos;

namespace LabPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BansController : ControllerBase
    {
        private readonly TESTContext _context;

        public BansController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/Bans
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<BanDto>>> GetBans()
        {
            if (_context.Bans == null)
            {
                return NotFound();
            }

            var bans = await _context.Bans.ToListAsync();
            var banDtos = bans.Select(ban => new BanDto
            {
                BanId = ban.BanId,
                UserId = ban.UserId,
                Reason = ban.Reason,
                ExpirationDate = ban.ExpirationDate
            }).ToList();

            return Ok(banDtos);
        }

        // GET: api/Bans/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BanDto>> GetBan(int id)
        {
            if (_context.Bans == null)
            {
                return NotFound();
            }

            var ban = await _context.Bans.FindAsync(id);

            if (ban == null)
            {
                return NotFound();
            }

            var banDto = new BanDto
            {
                BanId = ban.BanId,
                UserId = ban.UserId,
                Reason = ban.Reason,
                ExpirationDate = ban.ExpirationDate
            };

            return Ok(banDto);
        }

        // PUT: api/Bans/5
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutBan(int id, BanCreateDto banDto)
        {

            var ban = await _context.Bans.FindAsync(id);
            if (ban == null)
            {
                return NotFound();
            }

            ban.UserId = banDto.UserId;
            ban.Reason = banDto.Reason;
            ban.ExpirationDate = banDto.ExpirationDate;

            _context.Entry(ban).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BanExists(id))
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

        // POST: api/Bans
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BanDto>> PostBan(BanCreateDto banDto)
        {
            if (_context.Bans == null)
            {
                return Problem("Entity set 'TESTContext.Bans' is null.");
            }

            if (BanExists(banDto.UserId))
            {
                return BadRequest("A ban already exists for this user that has not yet expired.");
            }

            var ban = new Ban
            {
                UserId = banDto.UserId,
                Reason = banDto.Reason,
                ExpirationDate = banDto.ExpirationDate
            };

            _context.Bans.Add(ban);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating ban.");
            }

            return Ok();
        }

        // DELETE: api/Bans/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteBan(int id)
        {
            if (_context.Bans == null)
            {
                return NotFound();
            }

            var ban = await _context.Bans.FindAsync(id);
            if (ban == null)
            {
                return NotFound();
            }

            _context.Bans.Remove(ban);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Check if a ban exists based on UserId and the ban hasn't expired
        private bool BanExists(int userId)
        {
            return _context.Bans.Any(ban => ban.UserId == userId && ban.ExpirationDate > DateTime.UtcNow);
        }

        // GET: api/Bans/CheckBan/5
        [HttpGet("CheckBan/{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BanDto>> CheckBan(int userId)
        {
            if (_context.Bans == null)
            {
                return NotFound();
            }

            var ban = await _context.Bans
                .Where(b => b.UserId == userId && b.ExpirationDate > DateTime.UtcNow)
                .FirstOrDefaultAsync();

            if (ban == null)
            {
                return NotFound("No active ban found for this user.");
            }

            var banDto = new BanDto
            {
                BanId = ban.BanId,
                UserId = ban.UserId,
                Reason = ban.Reason,
                ExpirationDate = ban.ExpirationDate
            };

            return Ok(banDto);
        }
    }
}
