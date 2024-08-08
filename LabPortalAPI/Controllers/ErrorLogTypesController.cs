﻿using System;
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
        public async Task<ActionResult<IEnumerable<ErrorLogTypeLookup>>> GetErrorLogTypeLookups()
        {
          if (_context.ErrorLogTypeLookups == null)
          {
              return NotFound();
          }
            return await _context.ErrorLogTypeLookups.ToListAsync();
        }

        // GET: api/ErrorLogTypes/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ErrorLogTypeLookup>> GetErrorLogTypeLookup(int id)
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

            return errorLogTypeLookup;
        }

        // PUT: api/ErrorLogTypes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutErrorLogTypeLookup(int id, ErrorLogTypeLookup errorLogTypeLookup)
        {
            if (id != errorLogTypeLookup.TypeId)
            {
                return BadRequest();
            }

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
        public async Task<ActionResult<ErrorLogTypeLookup>> PostErrorLogTypeLookup(ErrorLogTypeLookup errorLogTypeLookup)
        {
          if (_context.ErrorLogTypeLookups == null)
          {
              return Problem("Entity set 'TESTContext.ErrorLogTypeLookups'  is null.");
          }
            _context.ErrorLogTypeLookups.Add(errorLogTypeLookup);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ErrorLogTypeLookupExists(errorLogTypeLookup.TypeId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetErrorLogTypeLookup", new { id = errorLogTypeLookup.TypeId }, errorLogTypeLookup);
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