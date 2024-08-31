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
using LabPortal.Models.CreateDtos;

namespace LabPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentsController : ControllerBase
    {
        private readonly TESTContext _context;

        public DepartmentsController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/Departments
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetDepartments()
        {
            if (_context.Departments == null)
            {
                return NotFound();
            }
            var departments = await _context.Departments.ToListAsync();
            var depertmentDtos = departments.Select(Department => new DepartmentDto
            {
                DeptId = Department.DeptId,
                Name = Department.Name,
                Password = Department.Password
            }).ToList();

            return Ok(depertmentDtos);
        }

        // GET: api/Departments/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<DepartmentDto>> GetDepartment(int id)
        {
            if (_context.Departments == null)
            {
                return NotFound();
            }
            var department = await _context.Departments.FindAsync(id);

            if (department == null)
            {
                return NotFound();
            }

            var departmentDto = new DepartmentDto
            {
                DeptId = department.DeptId,
                Name = department.Name,
                Password = department.Password
            };

            return Ok(departmentDto);
        }

        // PUT: api/Departments/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutDepartment(int id, DepartmentCreateDto departmentDto)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound();
            }

            department.Name = departmentDto.Name;
            department.Password = departmentDto.Password;
            _context.Entry(department).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DepartmentExists(id))
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

        // POST: api/Departments
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<DepartmentCreateDto>> PostDepartment(DepartmentCreateDto departmentDto)
        {
            if (_context.Departments == null)
            {
                return Problem("Entity set 'TESTContext.Departments'  is null.");
            }

            var department = new Department
            {
                Name = departmentDto.Name,
                Password = departmentDto.Password,
            };

            _context.Departments.Add(department);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Simplified the error as to not show more info than needed
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the department.");
            }

            return Ok();
        }

        // DELETE: api/Departments/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            if (_context.Departments == null)
            {
                return NotFound();
            }
            var department = await _context.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound();
            }

            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Departments/verify-password
        [HttpPost("verify-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> VerifyPassword(int deptId, string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                return BadRequest("Password is required.");
            }

            var department = await _context.Departments.FindAsync(deptId);
            if (department == null)
            {
                return NotFound();
            }

            if (department.Password == null || department.Password != password)
            {
                return BadRequest("Invalid password.");
            }

            return Ok("Password verified successfully.");
        }

        private bool DepartmentExists(int id)
        {
            return (_context.Departments?.Any(e => e.DeptId == id)).GetValueOrDefault();
        }
    }
}