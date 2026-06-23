using TodaAtividade.Application.DTOs;
using TodaAtividade.Application.Interfaces;
using TodaAtividade.Domain.Entities;
using TodaAtividade.Domain.Interfaces;

namespace TodaAtividade.Application.Services;

public class ProductService(IProductRepository repo) : IProductService
{
    public async Task<IReadOnlyList<ProductDto>> GetActiveAsync(
        string? grade, string? discipline, string? search,
        int page, int pageSize, CancellationToken ct)
    {
        var products = await repo.GetActiveAsync(grade, discipline, search, page, pageSize, ct);
        return products.Select(ToDto).ToList();
    }

    public async Task<ProductDto?> GetBySlugAsync(string slug, CancellationToken ct)
    {
        var product = await repo.GetBySlugAsync(slug, ct);
        return product is null ? null : ToDto(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken ct)
    {
        var product = Product.Create(
            dto.Title, dto.Slug, dto.Description, dto.Price,
            dto.ThumbnailUrl, dto.PreviewUrl, dto.FullPdfPath,
            dto.GradeLevel, dto.Discipline,
            dto.PedagogicalObjectives, dto.PageCount, dto.Tags);
        await repo.AddAsync(product, ct);
        return ToDto(product);
    }

    public async Task UpdateAsync(Guid id, UpdateProductDto dto, CancellationToken ct)
    {
        var product = await repo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Produto {id} não encontrado.");
        product.Update(dto.Title, dto.Description, dto.Price, dto.Active, dto.PedagogicalObjectives);
        await repo.UpdateAsync(product, ct);
    }

    public async Task ToggleStatusAsync(Guid id, bool active, CancellationToken ct)
    {
        var product = await repo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Produto {id} não encontrado.");
        if (active) product.Activate(); else product.Deactivate();
        await repo.UpdateAsync(product, ct);
    }

    private static ProductDto ToDto(Product p) => new(
        p.Id, p.Title, p.Slug, p.Description, p.PedagogicalObjectives,
        p.Price, p.ThumbnailUrl, p.PreviewUrl, p.GradeLevel, p.Discipline,
        p.PageCount, p.Tags, p.Active, p.CreatedAt);
}
