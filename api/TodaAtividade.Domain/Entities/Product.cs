namespace TodaAtividade.Domain.Entities;

public class Product
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Title { get; private set; } = default!;
    public string Slug { get; private set; } = default!;
    public string Description { get; private set; } = default!;
    public string? PedagogicalObjectives { get; private set; }
    public int Price { get; private set; }           // centavos
    public string ThumbnailUrl { get; private set; } = default!;
    public string PreviewUrl { get; private set; } = default!;
    public string FullPdfPath { get; private set; } = default!;  // privado no R2
    public string GradeLevel { get; private set; } = default!;   // 1ano ... 9ano
    public string Discipline { get; private set; } = default!;
    public int? PageCount { get; private set; }
    public string[]? Tags { get; private set; }
    public bool Active { get; private set; } = true;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; private set; } = DateTime.UtcNow;

    private Product() { }

    public static Product Create(
        string title, string slug, string description, int price,
        string thumbnailUrl, string previewUrl, string fullPdfPath,
        string gradeLevel, string discipline,
        string? pedagogicalObjectives = null, int? pageCount = null, string[]? tags = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(title);
        ArgumentException.ThrowIfNullOrWhiteSpace(slug);
        if (price < 0) throw new ArgumentOutOfRangeException(nameof(price), "Preço deve ser >= 0.");

        return new Product
        {
            Title = title,
            Slug = slug,
            Description = description,
            Price = price,
            ThumbnailUrl = thumbnailUrl,
            PreviewUrl = previewUrl,
            FullPdfPath = fullPdfPath,
            GradeLevel = gradeLevel,
            Discipline = discipline,
            PedagogicalObjectives = pedagogicalObjectives,
            PageCount = pageCount,
            Tags = tags,
        };
    }

    public void Update(string title, string description, int price, bool active,
        string? pedagogicalObjectives = null)
    {
        Title = title;
        Description = description;
        Price = price;
        Active = active;
        PedagogicalObjectives = pedagogicalObjectives;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate() { Active = false; UpdatedAt = DateTime.UtcNow; }
    public void Activate()   { Active = true;  UpdatedAt = DateTime.UtcNow; }
}
