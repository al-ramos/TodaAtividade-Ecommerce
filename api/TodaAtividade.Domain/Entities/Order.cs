namespace TodaAtividade.Domain.Entities;

public enum OrderStatus { Pending, Paid, Failed, Expired }
public enum PaymentMethod { Pix, CreditCard }

public class Order
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid UserId { get; private set; }
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public PaymentMethod? PaymentMethod { get; private set; }
    public string? PaymentId { get; private set; }   // ID do Mercado Pago
    public int Total { get; private set; }            // centavos
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; private set; }

    private readonly List<OrderItem> _items = [];
    public IReadOnlyList<OrderItem> Items => _items.AsReadOnly();

    private Order() { }

    public static Order Create(Guid userId, List<OrderItem> items)
    {
        if (items.Count == 0) throw new ArgumentException("Pedido deve ter ao menos 1 item.");
        var order = new Order
        {
            UserId = userId,
            Total = items.Sum(i => i.PriceAtPurchase),
        };
        order._items.AddRange(items);
        return order;
    }

    public void MarkAsPaid(string paymentId, Entities.PaymentMethod method)
    {
        Status = OrderStatus.Paid;
        PaymentId = paymentId;
        PaymentMethod = method;
        PaidAt = DateTime.UtcNow;
    }

    public void MarkAsFailed() => Status = OrderStatus.Failed;
    public void MarkAsExpired() => Status = OrderStatus.Expired;
}

public class OrderItem
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid OrderId { get; private set; }
    public Guid ProductId { get; private set; }
    public int PriceAtPurchase { get; private set; }  // centavos

    private OrderItem() { }

    public static OrderItem Create(Guid productId, int priceAtPurchase) =>
        new() { ProductId = productId, PriceAtPurchase = priceAtPurchase };
}
