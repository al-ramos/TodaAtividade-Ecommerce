using Microsoft.AspNetCore.Mvc;
using TodaAtividade.Application.Interfaces;
using TodaAtividade.Application.DTOs;

namespace TodaAtividade.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class ProductsController(IProductService productService) : ControllerBase
{
    /// <summary>Lista atividades ativas com filtros opcionais.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? grade,
        [FromQuery] string? discipline,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var products = await productService.GetActiveAsync(grade, discipline, search, page, pageSize, ct);
        return Ok(products);
    }

    /// <summary>Retorna uma atividade pelo slug.</summary>
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var product = await productService.GetBySlugAsync(slug, ct);
        return product is null ? NotFound() : Ok(product);
    }

    /// <summary>Cria uma nova atividade (admin).</summary>
    [HttpPost]
    // [Authorize(Roles = "Admin")] // habilitar após implementar roles
    public async Task<IActionResult> Create([FromBody] CreateProductDto dto, CancellationToken ct)
    {
        var product = await productService.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(GetBySlug), new { slug = product.Slug }, product);
    }

    /// <summary>Atualiza uma atividade (admin).</summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductDto dto, CancellationToken ct)
    {
        await productService.UpdateAsync(id, dto, ct);
        return NoContent();
    }

    /// <summary>Ativa ou desativa uma atividade (admin).</summary>
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> ToggleStatus(Guid id, [FromBody] ToggleStatusDto dto, CancellationToken ct)
    {
        await productService.ToggleStatusAsync(id, dto.Active, ct);
        return NoContent();
    }
}

public record ToggleStatusDto(bool Active);
