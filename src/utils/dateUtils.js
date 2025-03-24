export function formatDate(isoDate) {
	const date = new Date(isoDate);
	const options = {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	}; // Налаштування формату
	return date.toLocaleDateString('uk-UA', options); // Локалізований формат
}
