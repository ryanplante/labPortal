using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LabPortal.Models;

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
        public async Task<ActionResult<IEnumerable<Ban>>> GetBans()
        {
          if (_context.Bans == null)
          {
              return NotFound();
          }
            return await _context.Bans.ToListAsync();
        }

        // GET: api/BanControllerActions/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Ban>> GetBan(int id)
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

            return ban;
        }

        // PUT: api/BanControllerActions/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutBan(int id, Ban ban)
        {
            if (id != ban.BanId)
            {
                return BadRequest();
            }

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
        public async Task<ActionResult<Ban>> PostBan(Ban ban)
        {
          if (_context.Bans == null)
          {
              return Problem("Entity set 'TESTContext.Bans'  is null.");
          }
            _context.Bans.Add(ban);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (BanExists(ban.BanId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetBan", new { id = ban.BanId }, ban);
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
