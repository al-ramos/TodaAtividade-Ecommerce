using Dapper;
using Npgsql;
using TodaAtividade.Domain.Entities;
using TodaAtividade.Domain.Interfaces;

namespace TodaAtividade.Infrastructure.Repositories;

public class ProductRepository(string connectionString) : IProductRepository
{
    private NpgsqlConnection Connect() => new(connectionString);

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        using var conn = Connect();
        var row = await conn.QuerySingleOrDefaultAsync<dynamic>(
            "SELECT * FROM products WHERE id = @Id", new { Id = id });
        return row is null ? null : MapToProduct(row);
    }

    public async Task<Product?> GetBySlugAsync(string slug, CancellationToken ct)
    {
        using var conn = Connect();
        var row = await conn.QuerySingleOrDefaultAsync<dynamic>(
            "SELECT * FROM products WHERE slug = @Slug AND active = true", new { Slug = slug });
        return row is null ? null : MapToProduct(row);
    }

    public async Task<IReadOnlyList<Product>> GetActiveAsync(
        string? gradeLevel, string? discipline, string? search,
        int page, int pageSize, CancellationToken ct)
    {
        using var conn = Connect();
        var sql = """
            SELECT * FROM products
            WHERE active = true
              AND (@Grade IS NULL OR grade_level = @Grade)
              AND (@Discipline IS NULL OR discipline = @Discipline)
              AND (@Search IS NULL OR title ILIKE @SearchPattern)
            ORDER BY created_at DESC
            LIMIT @PageSize OFFSET @Offset
            """;
        var rows = await conn.QueryAsync<dynamic>(sql, new
        {
            Grade = gradeLevel,
            Discipline = discipline,
            Search = search,
            SearchPattern = search is null ? null : $"%{search}%",
            PageSize = pageSize,
            Offset = (page - 1) * pageSize,
        });
        return rows.Select(r => MapToProduct(r)).ToList();
    }

    public async Task AddAsync(Product product, CancellationToken ct)
    {
        using var conn = Connect();
        await conn.ExecuteAsync("""
            INSERT INTO products
              (id, title, slug, description, pedagogical_objectives, price,
               thumbnail_url, preview_url, full_pdf_path, grade_level, discipline,
               page_count, tags, active, created_at, updated_at)
            VALUES
              (@Id, @Title, @Slug, @Description, @PedagogicalObjectives, @Price,
               @ThumbnailUrl, @PreviewUrl, @FullPdfPath, @GradeLevel, @Discipline,
               @PageCount, @Tags, @Active, @CreatedAt, @UpdatedAt)
            """, new
        {
            product.Id, product.Title, product.Slug, product.Description,
            product.PedagogicalObjectives, product.Price, product.ThumbnailUrl,
            product.PreviewUrl, product.FullPdfPath, product.GradeLevel,
            product.Discipline, product.PageCount, Tags = product.Tags,
            product.Active, product.CreatedAt, product.UpdatedAt,
        });
    }

    public async Task UpdateAsync(Product product, CancellationToken ct)
    {
        using var conn = Connect();
        await conn.ExecuteAsync("""
            UPDATE products SET
              title = @Title, description = @Description, price = @Price,
              pedagogical_objectives = @PedagogicalObjectives,
              active = @Active, updated_at = @UpdatedAt
            WHERE id = @Id
            """, new
        {
            product.Id, product.Title, product.Description, product.Price,
            product.PedagogicalObjectives, product.Active, product.UpdatedAt,
        });
    }

    private static Product MapToProduct(dynamic r)
    {
        // Recria o produto a partir do banco usando reflexão sobre o objeto dinâmico
        return Product.Create(
            title: r.title, slug: r.slug, description: r.description,
            price: (int)r.price, thumbnailUrl: r.thumbnail_url,
            previewUrl: r.preview_url, fullPdfPath: r.full_pdf_path,
            gradeLevel: r.grade_level, discipline: r.discipline,
            pedagogicalObjectives: r.pedagogical_objectives,
            pageCount: (int?)r.page_count, tags: (string[]?)r.tags);
    }
}
