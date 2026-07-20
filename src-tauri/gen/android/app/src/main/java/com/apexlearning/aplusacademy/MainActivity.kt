package com.apexlearning.aplusacademy

import android.content.Intent
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.os.Bundle
import androidx.core.content.FileProvider
import androidx.activity.enableEdgeToEdge
import java.io.File

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    webView.addJavascriptInterface(BackupShareBridge(), "SkillForgeAndroid")
  }

  inner class BackupShareBridge {
    @JavascriptInterface
    fun shareBackup(filename: String, contents: String): Boolean {
      // Match the frontend/Rust 5 MiB soft ceiling so a hostile WebView call cannot
      // fill cache with unbounded backup payloads.
      if (contents.length > 5 * 1024 * 1024) {
        throw IllegalArgumentException("Backup payload is too large to share safely.")
      }
      val safeName = filename.replace(Regex("[^A-Za-z0-9._-]"), "_")
      val outDir = File(cacheDir, "backups")
      outDir.mkdirs()
      val outFile = File(outDir, safeName)
      outFile.writeText(contents, Charsets.UTF_8)

      val uri = FileProvider.getUriForFile(
        this@MainActivity,
        "${BuildConfig.APPLICATION_ID}.fileprovider",
        outFile
      )
      val sendIntent = Intent(Intent.ACTION_SEND).apply {
        type = "application/octet-stream"
        putExtra(Intent.EXTRA_STREAM, uri)
        putExtra(Intent.EXTRA_TITLE, safeName)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }
      startActivity(Intent.createChooser(sendIntent, "Share encrypted backup"))
      return true
    }
  }
}
