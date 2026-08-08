#include <cs50.h>
#include <stdio.h>

int main(void)
{
    int height;
    do
    {
        height = get_int("What's the height? ");
    }
    while(height < 1 || height > 8);

    for (int i = 0; i < height; i++)
    {
        for (int j = height - i; j > 1; j--)
        {
            printf(" ");
        }
        for (int k = i; k >= 0; k--)
        {
            printf("#");
        }

        printf("  ");

        for (int j = 0; j < i+1; j++)
        {
            printf("#");
        }
        printf("\n");
    }
}