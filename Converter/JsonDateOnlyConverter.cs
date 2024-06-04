using System;
using System.Text.Json;
using System.Text.Json.Serialization;

public class JsonDateOnlyConverter : JsonConverter<DateOnly>
{
    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            if (DateOnly.TryParse(reader.GetString(), out DateOnly date))
            {
                return date;
            }
        }

        // Corrected conversion for DateTimeOffset to DateOnly
        if (reader.GetDateTimeOffset().Date is DateTime dateTime)
        {
            return DateOnly.FromDateTime(dateTime);
        }

        throw new JsonException($"Unable to convert to {nameof(DateOnly)}.");
    }

    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("yyyy-MM-dd"));
    }
}
