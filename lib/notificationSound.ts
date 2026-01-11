// Singleton audio notification system
class NotificationSound {
  private audio: HTMLAudioElement | null = null
  private isUnlocked: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio('/notification.mp3')
      this.audio.volume = 0.8
      this.audio.load()
    }
  }

  // Kullanıcı etkileşimi ile unlock et
  async unlock(): Promise<void> {
    if (!this.audio || this.isUnlocked) return

    try {
      // Ses çal ve durdur - bu tarayıcıya "unlock" sinyali verir
      await this.audio.play()
      this.audio.pause()
      this.audio.currentTime = 0
      this.isUnlocked = true
      
      // Consent'i localStorage'a kaydet
      localStorage.setItem('audioConsentGranted', 'true')
      
      console.log('🔊 Bildirim sesleri BAŞARIYLA aktif edildi!')
    } catch (err) {
      console.error('Ses aktifleştirme hatası:', err)
      throw err
    }
  }

  // Bildirim sesi çal
  async play(): Promise<void> {
    if (!this.audio) {
      console.log('❌ Audio bulunamadı')
      return
    }

    if (!this.isUnlocked) {
      console.log('⚠️ Ses sistemi henüz aktif değil')
      throw new Error('Audio not unlocked')
    }

    try {
      // Sesi başa sar ve çal
      this.audio.pause()
      this.audio.currentTime = 0
      await this.audio.play()
      console.log('🔔 Bildirim sesi çalındı!')
    } catch (err) {
      console.error('❌ Ses çalma hatası:', err)
      // Tarayıcı tekrar engelledi - unlock durumunu resetle
      this.isUnlocked = false
      localStorage.removeItem('audioConsentGranted')
      throw err
    }
  }

  // Consent durumunu kontrol et
  hasConsent(): boolean {
    return localStorage.getItem('audioConsentGranted') === 'true'
  }

  // Unlock durumunu kontrol et
  isReady(): boolean {
    return this.isUnlocked
  }
}

// Singleton instance
export const notificationSound = new NotificationSound()
