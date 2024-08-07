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
    public class LabsController : ControllerBase
    {
        private readonly TESTContext _context;

        public LabsController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/Labs
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<Lab>>> GetLabs()
        {
          if (_context.Labs == null)
          {
              return NotFound();
          }
            return await _context.Labs.ToListAsync();
        }

        // GET: api/Labs/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Lab>> GetLab(int id)
        {
          if (_context.Labs == null)
          {
              return NotFound();
          }
            var lab = await _context.Labs.FindAsync(id);

            if (lab == null)
            {
                return NotFound();
            }

            return lab;
        }

        // PUT: api/Labs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutLab(int id, Lab lab)
        {
            if (id != lab.LabId)
            {
                return BadRequest();
            }

            _context.Entry(lab).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LabExists(id))
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

        // POST: api/Labs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Lab>> PostLab(Lab lab)
        {
          if (_context.Labs == null)
          {
              return Problem("Entity set 'TESTContext.Labs'  is null.");
          }
            _context.Labs.Add(lab);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (LabExists(lab.LabId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetLab", new { id = lab.LabId }, lab);
        }

        // DELETE: api/Labs/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteLab(int id)
        {
            if (_context.Labs == null)
            {
                return NotFound();
            }
            var lab = await _context.Labs.FindAsync(id);
            if (lab == null)
            {
                return NotFound();
            }

            _context.Labs.Remove(lab);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool LabExists(int id)
        {
            return (_context.Labs?.Any(e => e.LabId == id)).GetValueOrDefault();
        }
    }
}
