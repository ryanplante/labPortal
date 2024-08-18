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
        public async Task<ActionResult<IEnumerable<ScheduleTypeLookupDto>>> GetScheduleTypeLookups()
        {
            if (_context.ScheduleTypeLookups == null)
            {
                return NotFound();
            }
            var scheduleTypeLookups = await _context.ScheduleTypeLookups.ToListAsync();
            var scheduleTypeLookupDtos = scheduleTypeLookups.Select(ScheduleTypeLookup => new ScheduleTypeLookupDto
            {
                TypeId = ScheduleTypeLookup.TypeId,
                TypeName = ScheduleTypeLookup.TypeName

            }).ToList();

            return Ok(scheduleTypeLookupDtos);
        }

        // GET: api/ScheduleTypes/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ScheduleTypeLookupDto>> GetScheduleTypeLookup(int id)
<<<<<<< HEAD
=======
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

            var scheduleTypeLookupDto = new ScheduleTypeLookupDto
            {
                TypeId = scheduleTypeLookup.TypeId,
                TypeName = scheduleTypeLookup.TypeName
            };

            return Ok(scheduleTypeLookupDto);
        }

        // PUT: api/ScheduleTypes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutScheduleTypeLookup(int id, ScheduleTypeLookupDto scheduleTypeLookupDto)
        {
            if (id != scheduleTypeLookupDto.TypeId)
            {
                return BadRequest();
            }

            var scheduleTypeLookup = await _context.ScheduleTypeLookups.FindAsync(id);
            if (scheduleTypeLookup == null)
            {
                return NotFound();
            }

            scheduleTypeLookup.TypeName = scheduleTypeLookupDto.TypeName;

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
        public async Task<ActionResult<ScheduleTypeLookupDto>> PostScheduleTypeLookup(ScheduleTypeLookupDto scheduleTypeLookupDto)
        {
            if (_context.ScheduleTypeLookups == null)
            {
                return Problem("Entity set 'TESTContext.ScheduleTypeLookups'  is null.");
            }

            var scheduleTypeLookup = new ScheduleTypeLookup
            {
                TypeName = scheduleTypeLookupDto.TypeName
            };

            _context.ScheduleTypeLookups.Add(scheduleTypeLookup);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Simplified the error as to not show more info than needed
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the schedule type.");
            }

            return Ok();
        }

        // DELETE: api/ScheduleTypes/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteScheduleTypeLookup(int id)
>>>>>>> main
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

            var scheduleTypeLookupDto = new ScheduleTypeLookupDto
            {
                TypeId = scheduleTypeLookup.TypeId,
                TypeName = scheduleTypeLookup.TypeName
            };

            return Ok(scheduleTypeLookupDto);
        }

        //// PUT: api/ScheduleTypes/5
        //// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //[HttpPut("{id}")]
        //[ProducesResponseType(StatusCodes.Status200OK)]
        //[ProducesResponseType(StatusCodes.Status400BadRequest)]
        //public async Task<IActionResult> PutScheduleTypeLookup(int id, ScheduleTypeLookupDto scheduleTypeLookupDto)
        //{
        //    if (id != scheduleTypeLookupDto.TypeId)
        //    {
        //        return BadRequest();
        //    }

        //    var scheduleTypeLookup = await _context.ScheduleTypeLookups.FindAsync(id);
        //    if (scheduleTypeLookup == null)
        //    {
        //        return NotFound();
        //    }

        //    scheduleTypeLookup.TypeName = scheduleTypeLookupDto.TypeName;

        //    _context.Entry(scheduleTypeLookup).State = EntityState.Modified;

        //    try
        //    {
        //        await _context.SaveChangesAsync();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!ScheduleTypeLookupExists(id))
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

        //// POST: api/ScheduleTypes
        //// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //[HttpPost]
        //[ProducesResponseType(StatusCodes.Status200OK)]
        //[ProducesResponseType(StatusCodes.Status400BadRequest)]
        //public async Task<ActionResult<ScheduleTypeLookupDto>> PostScheduleTypeLookup(ScheduleTypeLookupDto scheduleTypeLookupDto)
        //{
        //    if (_context.ScheduleTypeLookups == null)
        //    {
        //        return Problem("Entity set 'TESTContext.ScheduleTypeLookups'  is null.");
        //    }

        //    var scheduleTypeLookup = new ScheduleTypeLookup
        //    {
        //        TypeName = scheduleTypeLookupDto.TypeName
        //    };

        //    _context.ScheduleTypeLookups.Add(scheduleTypeLookup);
        //    try
        //    {
        //        await _context.SaveChangesAsync();
        //    }
        //    catch (DbUpdateException ex)
        //    {
        //        // Simplified the error as to not show more info than needed
        //        return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the schedule type.");
        //    }

        //    return Ok();
        //}

        //// DELETE: api/ScheduleTypes/5
        //[HttpDelete("{id}")]
        //[ProducesResponseType(StatusCodes.Status200OK)]
        //[ProducesResponseType(StatusCodes.Status400BadRequest)]
        //public async Task<IActionResult> DeleteScheduleTypeLookup(int id)
        //{
        //    if (_context.ScheduleTypeLookups == null)
        //    {
        //        return NotFound();
        //    }
        //    var scheduleTypeLookup = await _context.ScheduleTypeLookups.FindAsync(id);
        //    if (scheduleTypeLookup == null)
        //    {
        //        return NotFound();
        //    }

        //    _context.ScheduleTypeLookups.Remove(scheduleTypeLookup);
        //    await _context.SaveChangesAsync();

        //    return NoContent();
        //}

        private bool ScheduleTypeLookupExists(int id)
        {
            return (_context.ScheduleTypeLookups?.Any(e => e.TypeId == id)).GetValueOrDefault();
        }
    }
}