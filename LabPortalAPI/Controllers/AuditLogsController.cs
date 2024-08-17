using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LabPortal.Models;
using LabPortal.Models.Dto;

namespace LabPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditLogsController : ControllerBase
    {
        private readonly TESTContext _context;

        public AuditLogsController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/AuditLogs
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogs()
        {
          if (_context.AuditLogs == null)
          {
              return NotFound();
          }
            return await _context.AuditLogs.ToListAsync();
        }

        // GET: api/AuditLogs/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AuditLog>> GetAuditLog(int id)
        {
          if (_context.AuditLogs == null)
          {
              return NotFound();
          }
            var auditLog = await _context.AuditLogs.FindAsync(id);

            if (auditLog == null)
            {
                return NotFound();
            }

            return auditLog;
        }

        // PUT: api/AuditLogs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //[HttpPut("{id}")]
        //[ProducesResponseType(StatusCodes.Status200OK)]
        //[ProducesResponseType(StatusCodes.Status400BadRequest)]
        //public async Task<IActionResult> PutAuditLog(int id, AuditLog auditLog)
        //{
        //    if (id != auditLog.LogId)
        //    {
        //        return BadRequest();
        //    }

        //    _context.Entry(auditLog).State = EntityState.Modified;

        //    try
        //    {
        //        await _context.SaveChangesAsync();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!AuditLogExists(id))
        //        {
        //            return NotFound();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return NoContent();
        //}

        // POST: api/AuditLogs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<AuditLogDto>> PostAuditLog(AuditLogDto auditLogDto)
        {
            if (_context.AuditLogs == null)
            {
                return Problem("Entity set 'TESTContext.AuditLogs' is null.");
            }

            var auditLog = new AuditLog
            {
                Description = auditLogDto.Description,
                // Auto generate timestamp so that the time can be universally the api time and in UTC format
                Timestamp = DateTime.UtcNow
            };

            _context.AuditLogs.Add(auditLog);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Simplified the error as to not show more info than needed
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the audit log.");
            }

            return Ok();
        }

        // DELETE: api/AuditLogs/5
        //[HttpDelete("{id}")]
        //[ProducesResponseType(StatusCodes.Status200OK)]
        //[ProducesResponseType(StatusCodes.Status400BadRequest)]
        //public async Task<IActionResult> DeleteAuditLog(int id)
        //{
        //    if (_context.AuditLogs == null)
        //    {
        //        return NotFound();
        //    }
        //    var auditLog = await _context.AuditLogs.FindAsync(id);
        //    if (auditLog == null)
        //    {
        //        return NotFound();
        //    }

        //    _context.AuditLogs.Remove(auditLog);
        //    await _context.SaveChangesAsync();

        //    return NoContent();
        //}

        private bool AuditLogExists(int id)
        {
            return (_context.AuditLogs?.Any(e => e.LogId == id)).GetValueOrDefault();
        }
    }
}
