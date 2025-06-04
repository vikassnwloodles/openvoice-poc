import os
import torch
from OpenVoice.openvoice import se_extractor
from OpenVoice.openvoice.api import ToneColorConverter
from melo.api import TTS

def tonecolor(ref_speaker, text, audio_speed, language):
    ckpt_converter = 'checkpoints_v2/converter'
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    output_dir = 'outputs_v2'

    tone_color_converter = ToneColorConverter(f'{ckpt_converter}/config.json', device=device)
    tone_color_converter.load_ckpt(f'{ckpt_converter}/checkpoint.pth')
    os.makedirs(output_dir, exist_ok=True)

    reference_speaker = ref_speaker

    target_se , audio_name = se_extractor.get_se(reference_speaker, tone_color_converter, vad=True)
    
    src_path = f'{output_dir}/tmp.wav'
    base_language_for_tts_init = language.split('-')[0].split('_')[0].upper()


    model = TTS(language=base_language_for_tts_init, device=device)
    speaker_ids = model.hps.data.spk2id

    actual_speaker_key = language
    speaker_id_to_use = speaker_ids[actual_speaker_key]

    formatted_speaker_key_for_file = actual_speaker_key.lower().replace('_', '-')
    
    source_se_path = f'checkpoints_v2/base_speakers/ses/{formatted_speaker_key_for_file}.pth'
    if not os.path.exists(source_se_path):
        error_msg = f"Source SE file not found: {source_se_path}"
        raise FileNotFoundError(error_msg)
    source_se = torch.load(source_se_path, map_location=device)

    if torch.backends.mps.is_available() and device== 'cpu':
        torch.backends.mps.is_available = lambda: False

    model.tts_to_file(
        text,
        speaker_id_to_use,
        output_path=src_path,
        speed=audio_speed)
    save_path = f'{output_dir}/output_v2_{formatted_speaker_key_for_file}.wav'
    encode_message = "@MyShell"
    tone_color_converter.convert(
        audio_src_path=src_path,
        src_se=source_se,
        tgt_se=target_se,
        output_path=save_path,
        message=encode_message
    )
    return save_path, "output_v2_{formatted_speaker_key_for_file}.wav"



        






