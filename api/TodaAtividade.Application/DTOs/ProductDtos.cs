namespace TodaAtividade.Application.DTOs;

public record ProductDto(
    Guid Id, string Title, string Slug, string Description,
    string? PedagogicalObjectives, int Price, string ThumbnailUrl,
    string PreviewUrl, string GradeLevel, string Discipline,
    int? PageCount, string[]? Tags, bool Active, DateTime CreatedAt);

public record CreateProductDto(
    string Title, string Slug, string Description, int Price,
    string ThumbnailUrl, string PreviewUrl, string FullPdfPath,
    string GradeLevel, string Discipline,
    string? PedagogicalObjectives = null, int? PageCount = null, string[]? Tags = null);

public record UpdateProductDto(
    string Title, string Description, int Price, bool Active,
    string? PedagogicalObjectives = null);
