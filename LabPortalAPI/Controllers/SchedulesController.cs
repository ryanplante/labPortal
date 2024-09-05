using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LabPortal.Models;
using LabPortal.Models.Dto;
using LabPortal.Models.CreateDtos;
using Microsoft.Data.SqlClient;
using System.Data;

namespace LabPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScheduleController : ControllerBase
    {
        private readonly TESTContext _context;

        public ScheduleController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/Schedule/Department/{departmentId}?startDate=yyyy-MM-dd&endDate=yyyy-MM-dd
        [HttpGet("Department/{departmentId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<WorkSchedule>>> GetWorkScheduleWithExemptionsByDepartment(int departmentId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var schedules = new List<WorkSchedule>();

            using (var connection = _context.Database.GetDbConnection())
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "EXEC [dbo].[usp_GetWorkScheduleWithExemptionsByDepartment] @DepartmentID, @StartDate, @EndDate";
                    command.Parameters.Add(new SqlParameter("@DepartmentID", departmentId));
                    command.Parameters.Add(new SqlParameter("@StartDate", startDate));
                    command.Parameters.Add(new SqlParameter("@EndDate", endDate));

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var schedule = new WorkSchedule
                            {
                                ScheduleId = reader.IsDBNull(0) ? (int?)null : reader.GetInt32(0),
                                DayOfWeek = reader.IsDBNull(1) ? (int?)null : reader.GetInt32(1),
                                Hours = reader.IsDBNull(2) ? null : reader.GetString(2),
                                FkLab = reader.IsDBNull(3) ? (int?)null : reader.GetInt32(3),
                                Lab = reader.IsDBNull(4) ? null : reader.GetString(4),
                                UserId = reader.GetInt32(5),
                                User = reader.GetString(6),
                                ScheduleType = reader.GetString(7)
                            };

                            schedules.Add(schedule);
                        }
                    }
                }
            }


            return Ok(schedules);
        }

        // GET: api/Schedule/LabSummary
        [HttpGet("LabSummary")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<LabScheduleSummaryDto>>> GetLabScheduleSummary()
        {
            var labSummaries = new List<LabScheduleSummaryDto>();

            using (var connection = _context.Database.GetDbConnection())
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "EXEC [dbo].[usp_GetLabScheduleSummary]";

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var labSummary = new LabScheduleSummaryDto
                            {
                                LabName = reader.GetString(0),
                                RoomNum = reader.GetString(1),
                                ScheduleSummary = reader.GetString(2)
                            };
                            labSummaries.Add(labSummary);
                        }
                    }
                }
            }

            if (!labSummaries.Any())
            {
                return NotFound("No lab schedule summaries found.");
            }

            return Ok(labSummaries);
        }

        // GET: api/Schedule/CurrentLab/{userId}
        [HttpGet("CurrentLab/{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<int>> GetCurrentLabForUser(int userId)
        {
            int? labId = null;

            using (var connection = _context.Database.GetDbConnection())
            {
                await connection.OpenAsync();
                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "EXEC [dbo].[usp_GetCurrentLabForUser] @UserID";
                    command.Parameters.Add(new SqlParameter("@UserID", userId));

                    labId = (int?)await command.ExecuteScalarAsync();
                }
            }

            if (labId == null)
            {
                return NotFound($"No current lab found for user with ID {userId}.");
            }

            return Ok(labId);
        }

        // POST: api/Schedule
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ScheduleDto>> CreateSchedule([FromBody] ScheduleCreateDto scheduleDto)
        {
            try
            {
                var schedule = new Schedule
                {
                    UserId = scheduleDto.UserId,
                    FkLab = scheduleDto.FkLab,
                    TimeIn = scheduleDto.TimeIn,
                    TimeOut = scheduleDto.TimeOut,
                    DayOfWeek = scheduleDto.DayOfWeek,
                    FkScheduleType = scheduleDto.FkScheduleType,
                    Location = scheduleDto.Location,
                };

                _context.Schedules.Add(schedule);
                await _context.SaveChangesAsync();

                var createdSchedule = new ScheduleDto
                {
                    ScheduleId = schedule.ScheduleId,
                    UserId = schedule.UserId,
                    FkLab = schedule.FkLab,
                    TimeIn = schedule.TimeIn,
                    TimeOut = schedule.TimeOut,
                    DayOfWeek = schedule.DayOfWeek,
                    FkScheduleType = schedule.FkScheduleType,
                    Location = schedule.Location,
                };

                return CreatedAtAction(nameof(GetScheduleById), new { id = schedule.ScheduleId }, createdSchedule);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
            }
        }

        // PUT: api/Schedule/{id}
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateSchedule(int id, [FromBody] ScheduleCreateDto scheduleDto)
        {
            var schedule = await _context.Schedules.FindAsync(id);
            if (schedule == null)
            {
                return NotFound($"Schedule with ID {id} not found.");
            }

            schedule.UserId = scheduleDto.UserId;
            schedule.FkLab = scheduleDto.FkLab;
            schedule.TimeIn = scheduleDto.TimeIn;
            schedule.TimeOut = scheduleDto.TimeOut;
            schedule.DayOfWeek = scheduleDto.DayOfWeek;
            schedule.FkScheduleType = scheduleDto.FkScheduleType;
            schedule.Location = scheduleDto.Location;

            _context.Entry(schedule).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Schedule/{id}
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var schedule = await _context.Schedules
                .Include(s => s.ScheduleExemptions)
                .FirstOrDefaultAsync(s => s.ScheduleId == id);

            if (schedule == null)
            {
                return NotFound($"Schedule with ID {id} not found.");
            }

            _context.Schedules.Remove(schedule);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Schedule/Exemptions
        [HttpGet("Exemptions")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<ScheduleExemptionDto>>> GetScheduleExemptions()
        {
            var exemptions = await _context.ScheduleExemptions
                .Select(se => new ScheduleExemptionDto
                {
                    ScheduleExemptionId = se.PkScheduleExemptions,
                    StartDate = se.StartDate,
                    EndDate = se.EndDate,
                    FkExemptionType = se.FkExemptionType,
                    FkUser = se.FkUser,
                    FkLab = se.FkLab,
                    Verified = se.Verified,
                    FkSchedule = se.FkSchedule
                })
                .ToListAsync();

            if (!exemptions.Any())
            {
                return NotFound("No schedule exemptions found.");
            }

            return Ok(exemptions);
        }

        // GET: api/Schedule/Exemptions/{id}
        [HttpGet("Exemptions/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ScheduleExemptionDto>> GetScheduleExemptionById(int id)
        {
            try
            {
                var exemption = await _context.ScheduleExemptions
                    .Select(se => new ScheduleExemptionDto
                    {
                        ScheduleExemptionId = se.PkScheduleExemptions,
                        StartDate = se.StartDate,
                        EndDate = se.EndDate,
                        FkExemptionType = se.FkExemptionType,
                        FkUser = se.FkUser,
                        FkLab = se.FkLab,
                        Verified = se.Verified,
                        FkSchedule = se.FkSchedule
                    })
                    .FirstOrDefaultAsync(se => se.ScheduleExemptionId == id);

                if (exemption == null)
                {
                    return NotFound($"Schedule exemption with ID {id} not found.");
                }

                return Ok(exemption);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
            }
        }


        // POST: api/Schedule/Exemptions
        [HttpPost("Exemptions")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ScheduleExemptionDto>> CreateScheduleExemption([FromBody] ScheduleCreateExemptionDto exemptionDto)
        {
            try
            {
                var exemption = new ScheduleExemption
                {
                    StartDate = exemptionDto.StartDate,
                    EndDate = exemptionDto.EndDate,
                    FkExemptionType = exemptionDto.FkExemptionType,
                    FkUser = exemptionDto.FkUser,
                    FkLab = exemptionDto.FkLab,
                    Verified = exemptionDto.Verified,
                    FkSchedule = exemptionDto.FkSchedule
                };

                _context.ScheduleExemptions.Add(exemption);
                await _context.SaveChangesAsync();

                var createdExemption = new ScheduleExemptionDto
                {
                    ScheduleExemptionId = exemption.PkScheduleExemptions,
                    StartDate = exemption.StartDate,
                    EndDate = exemption.EndDate,
                    FkExemptionType = exemption.FkExemptionType,
                    FkUser = exemption.FkUser,
                    FkLab = exemption.FkLab,
                    Verified = exemption.Verified,
                    FkSchedule = exemption.FkSchedule
                };

                return CreatedAtAction(nameof(GetScheduleExemptions), new { id = exemption.PkScheduleExemptions }, createdExemption);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
            }
        }

        // DELETE: api/Schedule/Exemptions/{id}
        [HttpDelete("Exemptions/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteScheduleExemption(int id)
        {
            var exemption = await _context.ScheduleExemptions.FindAsync(id);
            if (exemption == null)
            {
                return NotFound($"Schedule exemption with ID {id} not found.");
            }

            _context.ScheduleExemptions.Remove(exemption);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Schedule/{id}
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ScheduleDto>> GetScheduleById(int id)
        {
            var schedule = await _context.Schedules
                .Select(s => new ScheduleDto
                {
                    ScheduleId = s.ScheduleId,
                    UserId = s.UserId,
                    FkLab = s.FkLab,
                    TimeIn = s.TimeIn,
                    TimeOut = s.TimeOut,
                    DayOfWeek = s.DayOfWeek,
                    FkScheduleType = s.FkScheduleType,
                    Location = s.Location
                })
                .FirstOrDefaultAsync(s => s.ScheduleId == id);

            if (schedule == null)
            {
                return NotFound();
            }

            return Ok(schedule);
        }

        // PUT: api/Schedule/Exemptions/{id}
        [HttpPut("Exemptions/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateScheduleExemption(int id, [FromBody] ScheduleCreateExemptionDto exemptionDto)
        {
            try
            {
                var exemption = await _context.ScheduleExemptions.FindAsync(id);
                if (exemption == null)
                {
                    return NotFound($"Schedule exemption with ID {id} not found.");
                }

                exemption.StartDate = exemptionDto.StartDate;
                exemption.EndDate = exemptionDto.EndDate;
                exemption.FkExemptionType = exemptionDto.FkExemptionType;
                exemption.FkUser = exemptionDto.FkUser;
                exemption.FkLab = exemptionDto.FkLab;
                exemption.Verified = exemptionDto.Verified;
                exemption.FkSchedule = exemptionDto.FkSchedule;

                _context.Entry(exemption).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { error = ex.Message });
            }
        }
    }
}
