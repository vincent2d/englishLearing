param(
  [Parameter(Mandatory=$true)][string]$Text,
  [Parameter(Mandatory=$true)][string]$OutFile
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice("Microsoft Zira Desktop")
$synth.Rate = -2
$synth.Volume = 100
$synth.SetOutputToWaveFile($OutFile)
$synth.Speak($Text)
$synth.Dispose()
