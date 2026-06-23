using TodaAtividade.Application.DTOs;

namespace TodaAtividade.Application.Interfaces;

public interface IProductService
{
    Task<IReadOnlyList<ProductDto>> GetActiveAsync(
        string? grade, string? discipline, string? search,
        int page, int pageSize, CancellationToken ct);
    Task<ProductDto?> GetBySlugAsync(string slug, CancellationToken ct);
    Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken ct);
    Task UpdateAsync(Guid id, UpdateProductDto dto, CancellationToken ct);
    Task ToggleStatusAsync(Guid id, bool active, CancellationToken ct);
}
