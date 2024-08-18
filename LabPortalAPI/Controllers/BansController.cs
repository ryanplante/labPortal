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
    public class BansController : ControllerBase
    {
        private readonly TESTContext _context;

        public BansController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/BanControllerActions
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
            var banDtos = bans.Select(Ban => new BanDto
            {
                BanId = Ban.BanId,
                UserId = Ban.UserId,
                Reason = Ban.Reason,
                ExpirationDate = Ban.ExpirationDate
            }).ToList();

            return Ok(banDtos);
        }

        // GET: api/BanControllerActions/5
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

        // PUT: api/BanControllerActions/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutBan(int id, BanDto banDto)
        {
            if (id != banDto.BanId)
            {
                return BadRequest();
            }

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

        // POST: api/BanControllerActions
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BanDto>> PostBan(BanDto banDto)
        {
            if (_context.Bans == null)
            {
                return Problem("Entity set 'TESTContext.Bans'  is null.");
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
            catch (DbUpdateException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating ban.");
            }

            return Ok();
        }

        // DELETE: api/BanControllerActions/5
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

        private bool BanExists(int id)
        {
            return (_context.Bans?.Any(e => e.BanId == id)).GetValueOrDefault();
        }
    }
}