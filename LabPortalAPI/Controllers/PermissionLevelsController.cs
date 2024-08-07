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
        public async Task<ActionResult<IEnumerable<PermissionLookup>>> GetPermissionLookups()
        {
          if (_context.PermissionLookups == null)
          {
              return NotFound();
          }
            return await _context.PermissionLookups.ToListAsync();
        }

        // GET: api/Permissions/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PermissionLookup>> GetPermissionLookup(int id)
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

            return permissionLookup;
        }

        // PUT: api/Permissions/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutPermissionLookup(int id, PermissionLookup permissionLookup)
        {
            if (id != permissionLookup.UserLevel)
            {
                return BadRequest();
            }

            _context.Entry(permissionLookup).State = EntityState.Modified;

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
        public async Task<ActionResult<PermissionLookup>> PostPermissionLookup(PermissionLookup permissionLookup)
        {
          if (_context.PermissionLookups == null)
          {
              return Problem("Entity set 'TESTContext.PermissionLookups'  is null.");
          }
            _context.PermissionLookups.Add(permissionLookup);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (PermissionLookupExists(permissionLookup.UserLevel))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetPermissionLookup", new { id = permissionLookup.UserLevel }, permissionLookup);
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
