using System;

namespace DuDuPay
{
    public static class AppVersion
    {
        public static readonly string Timestamp = DateTime.UtcNow.Ticks.ToString();
    }
}
