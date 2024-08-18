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
    public class ErrorLogTypesController : ControllerBase
    {
        private readonly TESTContext _context;

        public ErrorLogTypesController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/ErrorLogTypes
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<ErrorLogTypeLookupDto>>> GetErrorLogTypeLookups()
        {
            if (_context.ErrorLogTypeLookups == null)
            {
                return NotFound();
            }
            var errorLogTypeLookups = await _context.ErrorLogTypeLookups.ToListAsync();
            var errorLogTypeLookupDtos = errorLogTypeLookups.Select(ErrorLogTypeLookup => new ErrorLogTypeLookupDto
            {
                TypeId = ErrorLogTypeLookup.TypeId,
                TypeName = ErrorLogTypeLookup.TypeName
            }).ToList();

            return Ok(errorLogTypeLookupDtos);
        }

        // GET: api/ErrorLogTypes/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ErrorLogTypeLookupDto>> GetErrorLogTypeLookup(int id)
        {
            if (_context.ErrorLogTypeLookups == null)
            {
                return NotFound();
            }
            var errorLogTypeLookup = await _context.ErrorLogTypeLookups.FindAsync(id);

            if (errorLogTypeLookup == null)
            {
                return NotFound();
            }

            var errorLogTypeLookupDto = new ErrorLogTypeLookupDto
            {
                TypeId = errorLogTypeLookup.TypeId,
                TypeName = errorLogTypeLookup.TypeName
            };

            return Ok(errorLogTypeLookupDto);
        }

        // PUT: api/ErrorLogTypes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutErrorLogTypeLookup(int id, ErrorLogTypeLookupDto errorLogTypeLookupDto)
        {
            if (id != errorLogTypeLookupDto.TypeId)
            {
                return BadRequest();
            }

            var errorLogTypeLookup = await _context.ErrorLogTypeLookups.FindAsync(id);
            if (errorLogTypeLookup == null)
            {
                return NotFound();
            }

            errorLogTypeLookup.TypeName = errorLogTypeLookupDto.TypeName;

            _context.Entry(errorLogTypeLookup).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ErrorLogTypeLookupExists(id))
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

        // POST: api/ErrorLogTypes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ErrorLogTypeLookupDto>> PostErrorLogTypeLookup(ErrorLogTypeLookupDto errorLogTypeLookupDto)
        {
            if (_context.ErrorLogTypeLookups == null)
            {
                return Problem("Entity set 'TESTContext.ErrorLogTypeLookups'  is null.");
            }

            var errorLogTypeLookup = new ErrorLogTypeLookup
            {
                TypeName = errorLogTypeLookupDto.TypeName
            };

            _context.ErrorLogTypeLookups.Add(errorLogTypeLookup);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Simplified the error as to not show more info than needed
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the error log type.");
            }

            return Ok();
        }

        // DELETE: api/ErrorLogTypes/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteErrorLogTypeLookup(int id)
        {
            if (_context.ErrorLogTypeLookups == null)
            {
                return NotFound();
            }
            var errorLogTypeLookup = await _context.ErrorLogTypeLookups.FindAsync(id);
            if (errorLogTypeLookup == null)
            {
                return NotFound();
            }

            _context.ErrorLogTypeLookups.Remove(errorLogTypeLookup);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ErrorLogTypeLookupExists(int id)
        {
            return (_context.ErrorLogTypeLookups?.Any(e => e.TypeId == id)).GetValueOrDefault();
        }
    }
}
