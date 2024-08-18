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
    public class PermissionLevelsController : ControllerBase
    {
        private readonly TESTContext _context;

        public PermissionLevelsController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/Permissions
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<PermissionLookupDto>>> GetPermissionLookups()
        {
            if (_context.PermissionLookups == null)
            {
                return NotFound();
            }
            var permissionLookups = await _context.PermissionLookups.ToListAsync();
            var permissionLookupDtos = permissionLookups.Select(permissionLookup => new PermissionLookupDto
            {
                Name = permissionLookup.Name,
            }).ToList();

            return Ok(permissionLookupDtos);
        }

        // GET: api/Permissions/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PermissionLookupDto>> GetPermissionLookup(int id)
        {
            if (_context.PermissionLookups == null)
            {
                return NotFound();
            }
            var permissionLookup = await _context.PermissionLookups.FindAsync(id);

            if (permissionLookup == null)
            {
                return NotFound();
            }

            var permissionLookupDto = new PermissionLookupDto
            {
                UserLevel = permissionLookup.UserLevel,
                Name = permissionLookup.Name
            };

            return Ok(permissionLookupDto);
        }

        // PUT: api/Permissions/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutPermissionLookup(int id, PermissionLookupDto permissionLookupDto)
        {
            if (id != permissionLookupDto.UserLevel)
            {
                return BadRequest();
            }

            var permissionLookup = await _context.PermissionLookups.FindAsync(id);
            if (permissionLookup == null)
            {
                return NotFound();
            }

            permissionLookup.Name = permissionLookupDto.Name;

            _context.Entry(permissionLookupDto).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PermissionLookupExists(id))
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

        // POST: api/Permissions
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<PermissionLookupDto>> PostPermissionLookup(PermissionLookupDto permissionLookupDto)
        {
            if (_context.PermissionLookups == null)
            {
                return Problem("Entity set 'TESTContext.PermissionLookups'  is null.");
            }

            var permissionLookup = new PermissionLookup
            {
                Name = permissionLookupDto.Name
            };

            _context.PermissionLookups.Add(permissionLookup);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Simplified the error as to not show more info than needed
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the permission level.");
            }

            return Ok();
        }

        // DELETE: api/Permissions/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeletePermissionLookup(int id)
        {
            if (_context.PermissionLookups == null)
            {
                return NotFound();
            }
            var permissionLookup = await _context.PermissionLookups.FindAsync(id);
            if (permissionLookup == null)
            {
                return NotFound();
            }

            _context.PermissionLookups.Remove(permissionLookup);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PermissionLookupExists(int id)
        {
            return (_context.PermissionLookups?.Any(e => e.UserLevel == id)).GetValueOrDefault();
        }
    }
}
