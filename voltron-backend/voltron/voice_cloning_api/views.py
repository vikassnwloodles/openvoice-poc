import os
import tempfile
from django.http import FileResponse, Http404
from django.core.files.uploadedfile import UploadedFile
from .tonecolor import tonecolor
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class Clone(APIView):

    def post(self, request):
        ref_audio_file = request.data.get('audio')
        text = request.data.get('text')
        speed = request.data.get('speed')

        language = request.data.get('language')
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
                language=language)

            if cloned_audio_path and os.path.exists(cloned_audio_path):
                try:
                    with open(cloned_audio_path, 'rb') as audio_file_to_send:
                        audio_data = audio_file_to_send.read()

                    response = FileResponse(open(
                        cloned_audio_path, 'rb'), as_attachment=True, filename=cloned_audio_filename)
                    return response
                except IOError:
                    return Response({
                        "error": "Could not read the cloned audio file."
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response({
                    "error": "Cloned audio file not found or path was not returned."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({
                "error": f"failed to clone audio : {e}"
            }, status=status.HTTP_400_BAD_REQUEST)
        finally:
            if tmp_audio_file_to_delete and os.path.exists(tmp_audio_file_to_delete):
                os.remove(tmp_audio_file_to_delete)
