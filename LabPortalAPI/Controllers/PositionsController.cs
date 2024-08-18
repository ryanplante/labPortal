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
        public async Task<ActionResult<IEnumerable<PositionLookupDto>>> GetPositionLookups()
        {
            if (_context.PositionLookups == null)
            {
                return NotFound();
            }

            var positionLookups = await _context.PositionLookups.ToListAsync();
            var positionLookupDtos = positionLookups.Select(PositionLookup => new PositionLookupDto
            {
                PositionId = PositionLookup.PositionId,
                Details = PositionLookup.Details

            }).ToList();

            return Ok(positionLookupDtos);
        }

        // GET: api/Positions/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PositionLookupDto>> GetPositionLookup(int id)
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

            var positionLookupDto = new PositionLookupDto
            {
                PositionId = positionLookup.PositionId,
                Details = positionLookup.Details
            };

            return Ok(positionLookupDto);
        }

        // PUT: api/Positions/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutPositionLookup(int id, PositionLookupDto positionLookupDto)
        {
            if (id != positionLookupDto.PositionId)
            {
                return BadRequest();
            }

            var positionLookup = await _context.PositionLookups.FindAsync(id);
            if (positionLookup == null)
            {
                return NotFound();
            }

            positionLookup.Details = positionLookupDto.Details;

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
        public async Task<ActionResult<PositionLookupDto>> PostPositionLookup(PositionLookupDto positionLookupDto)
        {
            if (_context.PositionLookups == null)
            {
                return Problem("Entity set 'TESTContext.PositionLookups'  is null.");
            }

            var positionLookup = new PositionLookup
            {
                Details = positionLookupDto.Details
            };

            _context.PositionLookups.Add(positionLookup);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Simplified the error as to not show more info than needed
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the position.");
            }

            return Ok();
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