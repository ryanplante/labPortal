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
    public class PositionsController : ControllerBase
    {
        private readonly TESTContext _context;

        public PositionsController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/Positions
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<PositionLookup>>> GetPositionLookups()
        {
          if (_context.PositionLookups == null)
          {
              return NotFound();
          }
            return await _context.PositionLookups.ToListAsync();
        }

        // GET: api/Positions/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PositionLookup>> GetPositionLookup(int id)
        {
          if (_context.PositionLookups == null)
          {
              return NotFound();
          }
            var positionLookup = await _context.PositionLookups.FindAsync(id);

            if (positionLookup == null)
            {
                return NotFound();
            }

            return positionLookup;
        }

        // PUT: api/Positions/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutPositionLookup(int id, PositionLookup positionLookup)
        {
            if (id != positionLookup.PositionId)
            {
                return BadRequest();
            }

            _context.Entry(positionLookup).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PositionLookupExists(id))
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

        // POST: api/Positions
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PositionLookup>> PostPositionLookup(PositionLookup positionLookup)
        {
          if (_context.PositionLookups == null)
          {
              return Problem("Entity set 'TESTContext.PositionLookups'  is null.");
          }
            _context.PositionLookups.Add(positionLookup);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (PositionLookupExists(positionLookup.PositionId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetPositionLookup", new { id = positionLookup.PositionId }, positionLookup);
        }

        // DELETE: api/Positions/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeletePositionLookup(int id)
        {
            if (_context.PositionLookups == null)
            {
                return NotFound();
            }
            var positionLookup = await _context.PositionLookups.FindAsync(id);
            if (positionLookup == null)
            {
                return NotFound();
            }

            _context.PositionLookups.Remove(positionLookup);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PositionLookupExists(int id)
        {
            return (_context.PositionLookups?.Any(e => e.PositionId == id)).GetValueOrDefault();
        }
    }
}
