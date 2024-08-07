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
    public class ScheduleTypesController : ControllerBase
    {
        private readonly TESTContext _context;

        public ScheduleTypesController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/ScheduleTypes
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<ScheduleTypeLookup>>> GetScheduleTypeLookups()
        {
          if (_context.ScheduleTypeLookups == null)
          {
              return NotFound();
          }
            return await _context.ScheduleTypeLookups.ToListAsync();
        }

        // GET: api/ScheduleTypes/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ScheduleTypeLookup>> GetScheduleTypeLookup(int id)
        {
          if (_context.ScheduleTypeLookups == null)
          {
              return NotFound();
          }
            var scheduleTypeLookup = await _context.ScheduleTypeLookups.FindAsync(id);

            if (scheduleTypeLookup == null)
            {
                return NotFound();
            }

            return scheduleTypeLookup;
        }

        // PUT: api/ScheduleTypes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutScheduleTypeLookup(int id, ScheduleTypeLookup scheduleTypeLookup)
        {
            if (id != scheduleTypeLookup.TypeId)
            {
                return BadRequest();
            }

            _context.Entry(scheduleTypeLookup).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ScheduleTypeLookupExists(id))
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

        // POST: api/ScheduleTypes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ScheduleTypeLookup>> PostScheduleTypeLookup(ScheduleTypeLookup scheduleTypeLookup)
        {
          if (_context.ScheduleTypeLookups == null)
          {
              return Problem("Entity set 'TESTContext.ScheduleTypeLookups'  is null.");
          }
            _context.ScheduleTypeLookups.Add(scheduleTypeLookup);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ScheduleTypeLookupExists(scheduleTypeLookup.TypeId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetScheduleTypeLookup", new { id = scheduleTypeLookup.TypeId }, scheduleTypeLookup);
        }

        // DELETE: api/ScheduleTypes/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteScheduleTypeLookup(int id)
        {
            if (_context.ScheduleTypeLookups == null)
            {
                return NotFound();
            }
            var scheduleTypeLookup = await _context.ScheduleTypeLookups.FindAsync(id);
            if (scheduleTypeLookup == null)
            {
                return NotFound();
            }

            _context.ScheduleTypeLookups.Remove(scheduleTypeLookup);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ScheduleTypeLookupExists(int id)
        {
            return (_context.ScheduleTypeLookups?.Any(e => e.TypeId == id)).GetValueOrDefault();
        }
    }
}
