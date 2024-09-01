using System;
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
            var departments = await _context.Departments
                                             .Where(d => d.DeptId != 0) // Filter out DeptId 0
                                             .ToListAsync();

            var departmentDtos = departments.Select(department => new DepartmentDto
            {
                DeptId = department.DeptId,
                Name = department.Name,
                Password = department.Password
            }).ToList();

            return Ok(departmentDtos);
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

            // Ensure we don't return the department with DeptId 0
            var department = await _context.Departments
                                           .Where(d => d.DeptId != 0 && d.DeptId == id)
                                           .FirstOrDefaultAsync();

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

            // Update department details
            department.Name = departmentDto.Name;
            department.Password = departmentDto.Password;
            _context.Entry(department).State = EntityState.Modified;

            // Handle department head promotion/demotion
            if (departmentDto.DepartmentHeadId.HasValue)
            {
                var newHead = await _context.Users.FindAsync(departmentDto.DepartmentHeadId.Value);
                if (newHead == null)
                {
                    return BadRequest("Invalid Department Head User ID.");
                }

                // Check if the new head is different from the current head
                var currentHead = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserDept == id && u.PrivLvl == 4);

                if (currentHead == null || currentHead.UserId != newHead.UserId)
                {
                    if (newHead.PrivLvl == 4)
                    {
                        return BadRequest("This user is already a department head.");
                    }

                    // Demote previous head if they exist and are different from the new head
                    if (currentHead != null && currentHead.UserId != newHead.UserId)
                    {
                        currentHead.PrivLvl = 0;
                    }

                    // Promote the new head
                    newHead.PrivLvl = 4;
                    newHead.UserDept = id;
                }
            }
            else if (departmentDto.DepartmentHeadId == null)
            {
                // Demote the current head if no new head is assigned
                var currentHead = await _context.Users
                    .FirstOrDefaultAsync(u => u.UserDept == id && u.PrivLvl == 4);

                if (currentHead != null)
                {
                    currentHead.PrivLvl = 0;
                    currentHead.UserDept = 0; // Assign to the unknown department
                }
            }

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
            await _context.SaveChangesAsync();

            // Now that the department is created, get its ID
            int departmentId = department.DeptId;

            // Handle department head promotion (if one is assigned)
            if (departmentDto.DepartmentHeadId.HasValue)
            {
                var newHead = await _context.Users.FindAsync(departmentDto.DepartmentHeadId.Value);
                if (newHead == null)
                {
                    return BadRequest("Invalid Department Head User ID.");
                }

                if (newHead.PrivLvl == 4)
                {
                    return BadRequest("This user is already a department head.");
                }

                // Promote the new head
                newHead.PrivLvl = 4;
                newHead.UserDept = departmentId;
                await _context.SaveChangesAsync();
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

            // Remove all labs associated with this department
            var labs = _context.Labs.Where(l => l.DeptId == id).ToList();
            _context.Labs.RemoveRange(labs);

            // Reassign users to the unknown department (id 0)
            var users = _context.Users.Where(u => u.UserDept == id).ToList();
            foreach (var user in users)
            {
                user.UserDept = 0; // Assign to the unknown department
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
