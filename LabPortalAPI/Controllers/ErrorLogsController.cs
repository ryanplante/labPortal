﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LabPortal.Models;
using LabPortal.Models.Dto;
using LabPortal.Models.CreateDtos;

namespace LabPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ErrorLogsController : ControllerBase
    {
        private readonly TESTContext _context;

        public ErrorLogsController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/ErrorLogs
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<ErrorLogDto>>> GetErrorLogs()
        {
            if (_context.ErrorLogs == null)
            {
                return NotFound();
            }

            var errorLogs = await _context.ErrorLogs.ToListAsync();
            var errorLogsDtos = errorLogs.Select(ErrorLog => new ErrorLogDto
            {
                LogId = ErrorLog.LogId,
                LogType = ErrorLog.LogType,
                Timestamp = ErrorLog.Timestamp,
                Description = ErrorLog.Description,
                Stack = ErrorLog.Stack,
                Source = ErrorLog.Source,
                UserId = ErrorLog.UserId,
                Version = ErrorLog.Version,
                Platform = ErrorLog.Platform,
                

            }).ToList();

            return Ok(errorLogsDtos);
        }

        // GET: api/ErrorLogs/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ErrorLogDto>> GetErrorLog(int id)
        {
            if (_context.ErrorLogs == null)
            {
                return NotFound();
            }
            var errorLog = await _context.ErrorLogs.FindAsync(id);

            if (errorLog == null)
            {
                return NotFound();
            }

            var errorLogDto = new ErrorLogDto
            {
                LogId = errorLog.LogId,
                LogType = errorLog.LogType,
                Timestamp = errorLog.Timestamp,
                Description = errorLog.Description,
                Stack = errorLog.Stack,
                Source = errorLog.Source,
                UserId = errorLog.UserId,
                Version = errorLog.Version,
                Platform = errorLog.Platform,
            };

            return Ok(errorLogDto);
        }

        // POST: api/ErrorLogs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> PostErrorLog(ErrorLogCreateDto errorLogDto)
        {
            if (_context.ErrorLogs == null)
            {
                return Problem("Entity set 'TESTContext.ErrorLogs'  is null.");
            }

            var errorLog = new ErrorLog
            {
                LogType = errorLogDto.LogType,
                Timestamp = errorLogDto.Timestamp,
                Description = errorLogDto.Description,
                Stack = errorLogDto.Stack,
                Source = errorLogDto.Source,
                UserId = errorLogDto.UserId,
                Platform = errorLogDto.Platform,
                Version = errorLogDto.Version,
            };

            _context.ErrorLogs.Add(errorLog);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Simplified the error as to not show more info than needed
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the error log.");
            }

            return Ok();
        }

        // DELETE: api/ErrorLogs/5
        //[HttpDelete("{id}")]
        //[ProducesResponseType(StatusCodes.Status200OK)]
        //[ProducesResponseType(StatusCodes.Status400BadRequest)]
        //public async Task<IActionResult> DeleteErrorLog(int id)
        //{
        //    if (_context.ErrorLogs == null)
        //    {
        //        return NotFound();
        //    }
        //    var errorLog = await _context.ErrorLogs.FindAsync(id);
        //    if (errorLog == null)
        //    {
        //        return NotFound();
        //    }

        //    _context.ErrorLogs.Remove(errorLog);
        //    await _context.SaveChangesAsync();

        //    return NoContent();
        //}

        private bool ErrorLogExists(int id)
        {
            return (_context.ErrorLogs?.Any(e => e.LogId == id)).GetValueOrDefault();
        }
    }
}
