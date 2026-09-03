export function waUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function birthdayShareText(
  pageType: 'self' | 'someone_else',
  name: string,
  url: string,
): string {
  if (pageType === 'self') {
    return `🎂 It's my birthday! Open my page, see some photos and leave me a wish or a prayer (30 seconds). You'll get a card to post too 😄 ${url}`
  }
  return `🎂 It's ${name}'s birthday! Open this page and leave ${name} a wish or a prayer. It's a surprise wall 🤫 ${url}`
}

export function birthdayStatusText(pageType: 'self' | 'someone_else', name: string, url: string): string {
  if (pageType === 'self') {
    return `🎂 It's my birthday! Leave me a wish here 👉 ${url}`
  }
  return `🎂 It's ${name}'s birthday! Leave ${name} a wish here 👉 ${url}`
}

export function birthdayStoryText(url: string): string {
  return `My birthday wish wall is open 🎉 ${url}`
}

export function birthdayXText(url: string): string {
  return `It's my birthday 🎂 drop a wish or a prayer: ${url}`
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
