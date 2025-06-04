import os
import tempfile
from django.http import HttpResponse, Http404
from django.core.files.uploadedfile import UploadedFile
from .tonecolor import tonecolor
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

class Clone(APIView):

    def post(self, request):
        try:
            ref_audio_file = request.data.get('audio')
            text = request.data.get('text')
            speed = request.data.get('speed')
            language = request.data.get('language')
            if language == 'EN-INDIA':
                language = 'EN_INDIA'
            
            logger.info(f"Received request - Audio: {ref_audio_file}, Text length: {len(text) if text else 0}, Speed: {speed}, Language: {language}")
            
            if not all([ref_audio_file, text, speed, language]):
                return Response({
                    "error": "Missing one or more required fields"
                }, status=status.HTTP_400_BAD_REQUEST)

            if not isinstance(ref_audio_file, UploadedFile):
                return Response({
                    "error": "Invalid 'audio' field. Expected an uploaded file."
                }, status=status.HTTP_400_BAD_REQUEST)

            ref_audio_path = None
            tmp_audio_file_to_delete = None
            cloned_audio_path = None

            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
                    for chunk in ref_audio_file.chunks():
                        tmp_file.write(chunk)
                    ref_audio_path = tmp_file.name
                    tmp_audio_file_to_delete = ref_audio_path

                speed = float(speed)

                cloned_audio_path, cloned_audio_filename = tonecolor(
                    ref_speaker=ref_audio_path,
                    text=text,
                    audio_speed=speed,
                    language=language
                )

                if not cloned_audio_path or not os.path.exists(cloned_audio_path):
                    return Response({
                        "error": "Cloned audio file not found or path was not returned."
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                try:
                    with open(cloned_audio_path, 'rb') as audio_file:
                        audio_data = audio_file.read()

                    if not audio_data:
                        return Response({
                            "error": "Cloned audio file is empty."
                        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                    response = HttpResponse(
                        audio_data,
                        content_type='audio/wav'
                    )
                    response['Content-Disposition'] = f'attachment; filename="{cloned_audio_filename}"'
                    response['Content-Length'] = len(audio_data)
                    response['Accept-Ranges'] = 'bytes'
                    response['Cache-Control'] = 'no-cache'
                    
                    logger.info(f"Sending audio response - Size: {len(audio_data)} bytes")
                    return response
                    
                except IOError as e:
                    logger.error(f"IOError reading audio file: {e}")
                    return Response({
                        "error": "Could not read the cloned audio file."
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            except ValueError as e:
                logger.error(f"ValueError in processing: {e}")
                return Response({
                    "error": f"Invalid input parameters: {str(e)}"
                }, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Unexpected error in voice cloning: {e}")
                return Response({
                    "error": f"Failed to clone audio: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            finally:
                if tmp_audio_file_to_delete and os.path.exists(tmp_audio_file_to_delete):
                    try:
                        os.remove(tmp_audio_file_to_delete)
                        logger.info(f"Cleaned up temp file: {tmp_audio_file_to_delete}")
                    except Exception as e:
                        logger.warning(f"Failed to cleanup temp file {tmp_audio_file_to_delete}: {e}")
                
                if cloned_audio_path and os.path.exists(cloned_audio_path):
                    try:
                        os.remove(cloned_audio_path)
                        logger.info(f"Cleaned up cloned audio file: {cloned_audio_path}")
                    except Exception as e:
                        logger.warning(f"Failed to cleanup cloned audio file {cloned_audio_path}: {e}")

        except Exception as e:
            logger.error(f"Unexpected error in Clone view: {e}")
            return Response({
                "error": "Internal server error occurred."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)