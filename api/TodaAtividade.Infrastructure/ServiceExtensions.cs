using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TodaAtividade.Domain.Interfaces;
using TodaAtividade.Infrastructure.Repositories;

namespace TodaAtividade.Infrastructure;

public static class ServiceExtensions
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Supabase")
            ?? throw new InvalidOperationException("ConnectionStrings:Supabase não configurada.");

        services.AddScoped<IProductRepository>(_ => new ProductRepository(connectionString));
        return services;
    }
}
