using Microsoft.Extensions.DependencyInjection;
using TodaAtividade.Application.Interfaces;
using TodaAtividade.Application.Services;

namespace TodaAtividade.Application;

public static class ServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        return services;
    }
}
