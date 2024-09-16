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
    public class ItemsController : ControllerBase
    {
        private readonly TESTContext _context;

        public ItemsController(TESTContext context)
        {
            _context = context;
        }

        // GET: api/Items
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<ItemDto>>> GetItems([FromQuery] int? departmentId = null)
        {
            if (_context.Items == null)
            {
                return NotFound();
            }

            // Fetch items, optionally filtering by department ID
            var query = _context.Items.AsQueryable();

            if (departmentId.HasValue)
            {
                query = query.Where(item => item.FkLabNavigation.DeptId == departmentId.Value);
            }

            var items = await query.ToListAsync();

            if (!items.Any())
            {
                return NotFound("No items found for the given department.");
            }

            var itemDtos = items.Select(Item => new ItemDto
            {
                ItemId = Item.ItemId,
                Description = Item.Description,
                Lab = Item.FkLab,
                Quantity = Item.Quantity,
                SerialNum = Item.SerialNum,
                Picture = Item.Picture,

            }).ToList();

            return Ok(itemDtos);
        }


        // GET: api/Items/5
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ItemDto>> GetItem(int id)
        {
            if (_context.Items == null)
            {
                return NotFound();
            }
            var item = await _context.Items.FindAsync(id);

            if (item == null)
            {
                return NotFound();
            }

            var itemDto = new ItemDto
            {
                ItemId = item.ItemId,
                Description = item.Description,
                Lab = item.FkLab,
                Quantity = item.Quantity,
                SerialNum = item.SerialNum,
                Picture = item.Picture
            };

            return Ok(itemDto);
        }

        // PUT: api/Items/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutItem(int id, ItemDto itemDto)
        {

            var item = await _context.Items.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }
            item.FkLab = itemDto.Lab;
            item.Description = itemDto.Description;
            item.Quantity = itemDto.Quantity;
            item.SerialNum = itemDto.SerialNum;
            item.Picture = itemDto.Picture;

            _context.Entry(item).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ItemExists(id))
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

        // POST: api/Items
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ItemDto>> PostItem(ItemCreateDto itemDto)
        {
            if (_context.Items == null)
            {
                return Problem("Entity set 'TESTContext.Items'  is null.");
            }

            var item = new Item
            {
                Description = itemDto.Description,
                Quantity = itemDto.Quantity,
                SerialNum = itemDto.SerialNum,
                Picture = itemDto.Picture,
                FkLab = itemDto.Lab
            };

            _context.Items.Add(item);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Simplified the error as to not show more info than needed
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the item.");
            }

            return Ok();
        }

        // GET: api/Items/search/{labId}/{query}
        // This endpoint searches for items based on labId and query.
        // If labId is 0, it searches across all labs, and if query is null, it returns all items in the lab.
        [HttpGet("search/{labId}/{query?}")] // The query is optional here
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<ItemDto>>> SearchItems(int labId, string? query = null)
        {
            // Check if the Items context is null, which means no items are available.
            if (_context.Items == null)
            {
                return NotFound();
            }

            // If the query is null or empty, don't filter by the query.
            var lowerQuery = string.IsNullOrEmpty(query) ? null : query.ToLower();

            // Perform the search based on the labId and query.
            // If labId is 0, it ignores the lab filtering and searches across all labs.
            var items = await _context.Items
                .Where(i => (labId == 0 || i.FkLab == labId) && // Skip lab filtering if labId is 0
                            (lowerQuery == null || // If the query is null, skip query filtering
                             i.Description.ToLower().Contains(lowerQuery) ||
                             i.SerialNum.ToLower().Contains(lowerQuery))) // Search by description or serial number if query exists
                .ToListAsync();

            // If no items match the search criteria, return NotFound.
            if (!items.Any())
            {
                return NotFound();
            }

            // Map the search results to ItemDto objects for the response.
            var itemDtos = items.Select(item => new ItemDto
            {
                ItemId = item.ItemId,
                Description = item.Description,
                Lab = item.FkLab,
                Quantity = item.Quantity,
                SerialNum = item.SerialNum,
                Picture = item.Picture
            }).ToList();

            // Return the list of matching items as a 200 OK response.
            return Ok(itemDtos);
        }





        // DELETE: api/Items/5
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteItem(int id)
        {
            if (_context.Items == null)
            {
                return NotFound();
            }
            var item = await _context.Items.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            _context.Items.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ItemExists(int id)
        {
            return (_context.Items?.Any(e => e.ItemId == id)).GetValueOrDefault();
        }
    }
}