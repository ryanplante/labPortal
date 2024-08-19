using LabPortal.Models;
using LabPortal.Models.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LabPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditLogsTypeController : ControllerBase
    {
        private readonly TESTContext _context;

        public AuditLogsTypeController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/AuditLogsType
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<AuditLogTypeDto>>> GetAuditLogs()
        {
            if (_context.AuditLogTypes == null)
            {
                return NotFound();
            }

            var auditLogTypes = await _context.AuditLogTypes
                                    .Select(a => new AuditLogTypeDto
                                    {
                                        Id = a.Id,
                                        Name = a.Name
                                    })
                                    .ToListAsync();

            return Ok(auditLogTypes);
        }

        // GET: api/AuditLogsType/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AuditLogTypeDto>> GetAuditLog(int id)
        {
            if (_context.AuditLogTypes == null)
            {
                return NotFound();
            }

            var auditLogType = await _context.AuditLogTypes
                                    .Where(a => a.Id == id)
                                    .Select(a => new AuditLogTypeDto
                                    {
                                        Id = a.Id,
                                        Name = a.Name
                                    })
                                    .FirstOrDefaultAsync();

            if (auditLogType == null)
            {
                return NotFound();
            }

            return Ok(auditLogType);
        }
    }
}
