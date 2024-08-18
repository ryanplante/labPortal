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
    public class LogsController : ControllerBase
    {
        private readonly TESTContext _context;

        public LogsController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/Logs
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<LogDto>>> GetLogs()
        {
            if (_context.Logs == null)
            {
                return NotFound();
            }

            var logs = await _context.Logs.ToListAsync();
            var logDtos = logs.Select(Log => new LogDto
            {
                LogId = Log.LogId,
                StudentId = Log.StudentId,
                TimeIn = Log.TimeIn,
                TimeOut = Log.TimeOut,
                LabId = Log.LabId

            }).ToList();

            return Ok(logDtos);
        }

        // GET: api/Logs/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<LogDto>> GetLog(int id)
        {
            if (_context.Logs == null)
            {
                return NotFound();
            }
            var log = await _context.Logs.FindAsync(id);

            if (log == null)
            {
                return NotFound();
            }

            var logDto = new LogDto
            {
                LogId = log.LogId,
                StudentId = log.StudentId,
                TimeIn = log.TimeIn,
                TimeOut = log.TimeOut,
                LabId = log.LabId
            };

            return Ok(logDto);
        }

        // PUT: api/Logs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutLog(int id, LogDto logDto)
        {
            if (id != logDto.LogId)
            {
                return BadRequest();
            }

            var log = await _context.Logs.FindAsync(id);
            if (log == null)
            {
                return NotFound();
            }

            log.StudentId = logDto.StudentId;
            log.TimeIn = logDto.TimeIn;
            log.TimeOut = logDto.TimeOut;
            log.LabId = logDto.LabId;

            _context.Entry(log).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LogExists(id))
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

        // POST: api/Logs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<LogDto>> PostLog(LogDto logDto)
        {
            if (_context.Logs == null)
            {
                return Problem("Entity set 'TESTContext.Logs'  is null.");
            }

            var log = new Log
            {
                StudentId = logDto.StudentId,
                TimeIn = logDto.TimeIn,
                TimeOut = logDto.TimeOut,
                LabId = logDto.LabId
            };

            _context.Logs.Add(log);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Simplified the error as to not show more info than needed
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the log.");
            }

            return Ok();
        }

        // DELETE: api/Logs/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteLog(int id)
        {
            if (_context.Logs == null)
            {
                return NotFound();
            }
            var log = await _context.Logs.FindAsync(id);
            if (log == null)
            {
                return NotFound();
            }

            _context.Logs.Remove(log);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool LogExists(int id)
        {
            return (_context.Logs?.Any(e => e.LogId == id)).GetValueOrDefault();
        }
    }
}
