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
    public class LabsController : ControllerBase
    {
        private readonly TESTContext _context;

        public LabsController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/Labs
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<LabDto>>> GetLabs()
        {
            if (_context.Labs == null)
            {
                return NotFound();
            }

            var labs = await _context.Labs.ToListAsync();
            var labDtos = labs.Select(Lab => new LabDto
            {
                LabId = Lab.LabId,
                Name = Lab.Name,
                RoomNum = Lab.RoomNum,
                DeptId = Lab.DeptId

            }).ToList();

            return Ok(labDtos);
        }

        // GET: api/Labs/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<LabDto>> GetLab(int id)
        {
            if (_context.Labs == null)
            {
                return NotFound();
            }
            var lab = await _context.Labs.FindAsync(id);

            if (lab == null)
            {
                return NotFound();
            }

            var labDto = new LabDto
            {
                LabId = lab.LabId,
                Name = lab.Name,
                RoomNum = lab.RoomNum,
                DeptId = lab.DeptId
            };

            return Ok(labDto);
        }

        // PUT: api/Labs/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutLab(int id, LabDto labDto)
        {
            if (id != labDto.LabId)
            {
                return BadRequest();
            }

            var lab = await _context.Labs.FindAsync(id);
            if (lab == null)
            {
                return NotFound();
            }

            lab.Name = labDto.Name;
            lab.RoomNum = labDto.RoomNum;
            lab.DeptId = labDto.DeptId;

            _context.Entry(lab).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LabExists(id))
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

        // POST: api/Labs
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<LabDto>> PostLab(LabDto labDto)
        {
            if (_context.Labs == null)
            {
                return Problem("Entity set 'TESTContext.Labs'  is null.");
            }

            var lab = new Lab
            {
                Name = labDto.Name,
                RoomNum = labDto.RoomNum,
                DeptId = labDto.DeptId
            };

            _context.Labs.Add(lab);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Simplified the error as to not show more info than needed
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the lab.");
            }

            return Ok();
        }

        // DELETE: api/Labs/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteLab(int id)
        {
            if (_context.Labs == null)
            {
                return NotFound();
            }
            var lab = await _context.Labs.FindAsync(id);
            if (lab == null)
            {
                return NotFound();
            }

            _context.Labs.Remove(lab);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool LabExists(int id)
        {
            return (_context.Labs?.Any(e => e.LabId == id)).GetValueOrDefault();
        }
    }
}