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
    public class SchedulesController : ControllerBase
    {
        private readonly TESTContext _context;

        public SchedulesController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/Schedules
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<ScheduleDto>>> GetSchedules()
        {
            if (_context.Schedules == null)
            {
                return NotFound();
            }

            var schedules = await _context.Schedules.ToListAsync();
            var scheduleDtos = schedules.Select(Schedule => new ScheduleDto
            {
                ScheduleId = Schedule.ScheduleId,
                UserId = Schedule.UserId,
                ScheduleType = Schedule.ScheduleType,
                TextSchedule = Schedule.TextSchedule,
                Location = Schedule.Location
            }).ToList();

            return Ok(scheduleDtos);
        }

        // GET: api/Schedules/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ScheduleDto>> GetSchedule(int id)
        {
            if (_context.Schedules == null)
            {
                return NotFound();
            }
            var schedule = await _context.Schedules.FindAsync(id);

            if (schedule == null)
            {
                return NotFound();
            }

            var scheduleDto = new ScheduleDto
            {
                ScheduleId = schedule.ScheduleId,
                UserId = schedule.UserId,
                ScheduleType = schedule.ScheduleType,
                TextSchedule = schedule.TextSchedule,
                Location = schedule.Location
            };

            return Ok(scheduleDto);
        }

        // PUT: api/Schedules/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutSchedule(int id, ScheduleDto scheduleDto)
        {
            if (id != scheduleDto.ScheduleId)
            {
                return BadRequest();
            }

            var schedule = await _context.Schedules.FindAsync(id);
            if (schedule == null)
            {
                return NotFound();
            }

            schedule.UserId = scheduleDto.UserId;
            schedule.ScheduleType = scheduleDto.ScheduleType;
            schedule.TextSchedule = scheduleDto.TextSchedule;
            schedule.Location = scheduleDto.Location;

            _context.Entry(schedule).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ScheduleExists(id))
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

        // POST: api/Schedules
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ScheduleDto>> PostSchedule(ScheduleDto scheduleDto)
        {
            if (_context.Schedules == null)
            {
                return Problem("Entity set 'TESTContext.Schedules'  is null.");
            }

            var schedule = new Schedule
            {
                UserId = scheduleDto.UserId,
                ScheduleType = scheduleDto.ScheduleType,
                TextSchedule = scheduleDto.TextSchedule,
                Location = scheduleDto.Location
            };

            _context.Schedules.Add(schedule);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Simplified the error as to not show more info than needed
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the schedule.");
            }

            return Ok();
        }

        // DELETE: api/Schedules/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            if (_context.Schedules == null)
            {
                return NotFound();
            }
            var schedule = await _context.Schedules.FindAsync(id);
            if (schedule == null)
            {
                return NotFound();
            }

            _context.Schedules.Remove(schedule);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ScheduleExists(int id)
        {
            return (_context.Schedules?.Any(e => e.ScheduleId == id)).GetValueOrDefault();
        }
    }
}
