export function formatQuestionDate(
    createdAt: string
  ): string {
    const date = new Date(createdAt);
    const today = new Date();
  
    if (Number.isNaN(date.getTime())) {
      return "Fecha desconocida";
    }
  
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (date >= startOfToday) {
        return "Hoy";
    }
  
    const startOfWeek = new Date(startOfToday);

    if (date >= startOfWeek) {
        return "Esta semana";
    }

    const daysSinceMonday =
      (today.getDay() + 6) % 7;
  
    startOfWeek.setDate(
      startOfWeek.getDate() - daysSinceMonday
    );
  
    const startOfMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    if (date >= startOfMonth) {
        return "Este mes";
    }
  
    const startOfYear = new Date(
      today.getFullYear(),
      0,
      1
    );
  
    if (date >= startOfYear) {
      return "Este año";
    }
  
    const yearsAgo =
      today.getFullYear() - date.getFullYear();
  
    return yearsAgo === 1
      ? "Hace 1 año"
      : `Hace ${yearsAgo} años`;
  }