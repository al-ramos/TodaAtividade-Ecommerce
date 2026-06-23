using TodaAtividade.Domain.Entities;

namespace TodaAtividade.Domain.Interfaces;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Product?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<IReadOnlyList<Product>> GetActiveAsync(
        string? gradeLevel = null,
        string? discipline = null,
        string? search = null,
        int page = 1,
        int pageSize = 20,
        CancellationToken ct = default);
    Task AddAsync(Product product, CancellationToken ct = default);
    Task UpdateAsync(Product product, CancellationToken ct = default);
}
